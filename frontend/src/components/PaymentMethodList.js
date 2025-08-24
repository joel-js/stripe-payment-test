import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PaymentMethodCard from './PaymentMethodCard';

const PaymentMethodList = ({ onPaymentMethodRemoved }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      console.log('Fetching payment methods...');
      const response = await api.get('/api/stripe/payment-methods');
      console.log('Payment methods response:', response.data);
      setPaymentMethods(response.data.payment_methods || []);
      setError('');
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err.response?.data?.detail || 'Failed to load payment methods');
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (paymentMethodId) => {
    try {
      console.log('Removing payment method:', paymentMethodId);
      await api.delete(`/api/stripe/payment-methods/${paymentMethodId}`);
      console.log('Payment method removed successfully');
      
      setPaymentMethods(prev => 
        prev.filter(pm => pm.stripe_payment_method_id !== paymentMethodId)
      );
      
      if (onPaymentMethodRemoved) {
        onPaymentMethodRemoved();
      }
    } catch (err) {
      console.error('Error removing payment method:', err);
      setError(err.response?.data?.detail || 'Failed to remove payment method');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading payment methods...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={fetchPaymentMethods} className="btn" style={{ marginTop: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="empty-state">
        No payment methods saved yet. Add your first payment method below.
      </div>
    );
  }

  return (
    <div>
      {paymentMethods.map((paymentMethod) => (
        <PaymentMethodCard
          key={paymentMethod.id}
          paymentMethod={paymentMethod}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
};

export default PaymentMethodList;