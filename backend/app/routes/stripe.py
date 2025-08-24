import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, PaymentMethod
from ..schemas.stripe import SetupIntentResponse, SavePaymentMethodRequest, PaymentMethodResponse, PaymentMethodsList
from ..utils.auth import get_current_user
from ..config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

@router.post("/setup-intent", response_model=SetupIntentResponse)
def create_setup_intent(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a Setup Intent for adding a payment method. Creates Stripe customer if first time."""
    try:
        existing_payment_method = db.query(PaymentMethod).filter(PaymentMethod.user_id == current_user.id).first()
        
        if existing_payment_method:
            customer_id = existing_payment_method.stripe_customer_id
        else:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={'user_id': str(current_user.id)}
            )
            customer_id = customer.id
        
        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            payment_method_types=['card'],
            usage='off_session'
        )
        
        return SetupIntentResponse(
            client_secret=setup_intent.client_secret,
            customer_id=customer_id
        )
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@router.post("/save-payment-method")
def save_payment_method(
    request: SavePaymentMethodRequest, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Save a payment method after successful Setup Intent confirmation."""
    try:
        setup_intent = stripe.SetupIntent.retrieve(request.setup_intent_id)
        
        if setup_intent.status != 'succeeded':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Setup Intent not succeeded"
            )
        
        payment_method = stripe.PaymentMethod.retrieve(request.payment_method_id)
        
        if payment_method.customer != setup_intent.customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment method customer mismatch"
            )
        
        existing_payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.stripe_payment_method_id == request.payment_method_id
        ).first()
        
        if existing_payment_method:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment method already exists"
            )
        
        is_first_payment_method = not db.query(PaymentMethod).filter(PaymentMethod.user_id == current_user.id).first()
        
        db_payment_method = PaymentMethod(
            user_id=current_user.id,
            stripe_customer_id=setup_intent.customer,
            stripe_payment_method_id=request.payment_method_id,
            is_default=is_first_payment_method
        )
        
        db.add(db_payment_method)
        db.commit()
        
        return {"message": "Payment method saved successfully"}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@router.get("/payment-methods", response_model=PaymentMethodsList)
def get_payment_methods(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all saved payment methods for the current user, with card details fetched from Stripe."""
    try:
        db_payment_methods = db.query(PaymentMethod).filter(PaymentMethod.user_id == current_user.id).all()
        
        payment_methods = []
        
        for db_pm in db_payment_methods:
            try:
                stripe_pm = stripe.PaymentMethod.retrieve(db_pm.stripe_payment_method_id)
                
                if stripe_pm.card:
                    payment_method_response = PaymentMethodResponse(
                        id=db_pm.id,
                        stripe_payment_method_id=db_pm.stripe_payment_method_id,
                        last4=stripe_pm.card.last4,
                        brand=stripe_pm.card.brand,
                        exp_month=stripe_pm.card.exp_month,
                        exp_year=stripe_pm.card.exp_year,
                        is_default=db_pm.is_default
                    )
                    payment_methods.append(payment_method_response)
            except stripe.error.StripeError:
                continue
        
        return PaymentMethodsList(payment_methods=payment_methods)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching payment methods"
        )

@router.delete("/payment-methods/{payment_method_id}")
def remove_payment_method(
    payment_method_id: str, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Remove a payment method from both Stripe and database."""
    try:
        db_payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.user_id == current_user.id,
            PaymentMethod.stripe_payment_method_id == payment_method_id
        ).first()
        
        if not db_payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        
        stripe.PaymentMethod.detach(payment_method_id)
        
        db.delete(db_payment_method)
        db.commit()
        
        return {"message": "Payment method removed successfully"}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )