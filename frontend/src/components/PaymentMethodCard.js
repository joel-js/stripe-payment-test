import React, { useState } from 'react';

const PaymentMethodCard = ({ paymentMethod, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      setRemoving(true);
      try {
        await onRemove(paymentMethod.stripe_payment_method_id);
      } catch (error) {
        console.error('Error removing payment method:', error);
      } finally {
        setRemoving(false);
      }
    }
  };

  const formatCardBrand = (brand) => {
    const brandMap = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay'
    };
    return brandMap[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <div className="payment-method">
      <div className="payment-method-info">
        <h4>{formatCardBrand(paymentMethod.brand)} •••• {paymentMethod.last4}</h4>
        <span>
          Expires {paymentMethod.exp_month.toString().padStart(2, '0')}/{paymentMethod.exp_year}
          {paymentMethod.is_default && ' • Default'}
        </span>
      </div>
      <div className="payment-method-actions">
        <button
          onClick={handleRemove}
          className="btn btn-danger"
          disabled={removing}
        >
          {removing ? (
            <div className="loading">
              <div className="spinner"></div>
              Removing...
            </div>
          ) : (
            'Remove'
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodCard;