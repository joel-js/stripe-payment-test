from pydantic import BaseModel
from typing import Optional
import uuid

class SetupIntentResponse(BaseModel):
    client_secret: str
    customer_id: str

class SavePaymentMethodRequest(BaseModel):
    payment_method_id: str
    setup_intent_id: str

class PaymentMethodResponse(BaseModel):
    id: uuid.UUID
    stripe_payment_method_id: str
    last4: str
    brand: str
    exp_month: int
    exp_year: int
    is_default: bool

class PaymentMethodsList(BaseModel):
    payment_methods: list[PaymentMethodResponse]