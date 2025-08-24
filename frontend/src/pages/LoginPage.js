import React, { useState } from 'react';
import { login, signup } from '../services/auth';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        console.log('Login successful');
      } else {
        await signup(email, password);
        console.log('Signup successful');
      }
      
      onLogin();
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Stripe Payment Test</h1>
      </div>
      <div className="container">
        <div className="card">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength="6"
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <div className="form-group">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    {isLogin ? 'Logging in...' : 'Signing up...'}
                  </div>
                ) : (
                  isLogin ? 'Login' : 'Sign Up'
                )}
              </button>
            </div>
          </form>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="toggle-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
              }}
            >
              {isLogin ? 'Sign up here' : 'Login here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;