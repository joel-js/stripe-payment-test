import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onSuccess, onCancel, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    if (!stripe || !elements) {
      console.log('Stripe not ready:', { stripe: !!stripe, elements: !!elements });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting elements...');
      
      // First, submit the elements
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        console.error('Elements submit error:', submitError);
        setError(submitError.message);
        setLoading(false);
        return;
      }

      console.log('Confirming Setup Intent with client secret:', clientSecret);
      
      // Then confirm the setup intent
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        console.error('Stripe confirmation error:', stripeError);
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      console.log('Setup Intent confirmed:', setupIntent);

      if (setupIntent.status === 'succeeded') {
        console.log('Saving payment method to backend...');
        
        await api.post('/api/stripe/save-payment-method', {
          payment_method_id: setupIntent.payment_method,
          setup_intent_id: setupIntent.id
        });
        
        console.log('Payment method saved successfully');
        onSuccess();
      } else {
        console.error('Setup Intent not succeeded:', setupIntent.status);
        setError('Payment method setup failed');
      }
    } catch (err) {
      console.error('Error saving payment method:', err);
      setError(err.response?.data?.detail || 'Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="stripe-element">
        <PaymentElement 
          options={{
            fields: {
              billingDetails: 'auto'
            }
          }}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={!stripe || loading} className="btn">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Saving...
            </div>
          ) : (
            'Save Payment Method'
          )}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

const AddPaymentMethod = ({ onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        console.log('Creating Setup Intent...');
        const response = await api.post('/api/stripe/setup-intent');
        console.log('Setup Intent created:', response.data);
        setClientSecret(response.data.client_secret);
      } catch (err) {
        console.error('Error creating Setup Intent:', err);
      }
    };

    createSetupIntent();
  }, []);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#635bff',
      },
    },
  };

  if (!clientSecret) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Setting up payment form...
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} clientSecret={clientSecret} />
    </Elements>
  );
};

export default AddPaymentMethod;