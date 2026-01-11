import api from './config/api';

// ...existing code...

const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Server timeout - please try again');
    }
    if (error.message === 'Network Error') {
      throw new Error('Cannot connect to server. Is your backend running?');
    }
    throw error;
  }
};