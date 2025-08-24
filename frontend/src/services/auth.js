import api from './api';

export const signup = async (email, password) => {
  try {
    const response = await api.post('/api/auth/signup', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data);
    throw error.response?.data || { detail: 'Signup failed' };
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    throw error.response?.data || { detail: 'Login failed' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error.response?.data);
    throw error.response?.data || { detail: 'Failed to get user info' };
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};