import React, { useState, useEffect } from 'react';
import { logout, getCurrentUser } from '../services/auth';
import PaymentMethodList from '../components/PaymentMethodList';
import AddPaymentMethod from '../components/AddPaymentMethod';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [refreshPaymentMethods, setRefreshPaymentMethods] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        console.log('User loaded:', userData);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handlePaymentMethodAdded = () => {
    setShowAddPayment(false);
    setRefreshPaymentMethods(prev => prev + 1);
  };

  const handlePaymentMethodRemoved = () => {
    setRefreshPaymentMethods(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="header">
          <h1>Error</h1>
        </div>
        <div className="container">
          <div className="card">
            <div className="error">{error}</div>
            <button onClick={logout} className="btn">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Payment Methods Dashboard</h1>
        <p>Welcome, {user?.email}</p>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
      <div className="container">
        <div className="card">
          <h2>Saved Payment Methods</h2>
          <PaymentMethodList 
            key={refreshPaymentMethods} 
            onPaymentMethodRemoved={handlePaymentMethodRemoved}
          />
          
          {!showAddPayment ? (
            <div className="add-payment-section">
              <button 
                onClick={() => setShowAddPayment(true)}
                className="btn"
              >
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="add-payment-section">
              <h3>Add New Payment Method</h3>
              <AddPaymentMethod 
                onSuccess={handlePaymentMethodAdded}
                onCancel={() => setShowAddPayment(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;