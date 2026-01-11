// Add timeout and better error handling
const registerUser = async (userData) => {
  try {
    const response = await axios.post('/register', userData, {
      timeout: 10000, // 10 second timeout
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - server not responding');
    }
    if (error.message === 'Network Error') {
      throw new Error('Cannot connect to server. Check if backend is running.');
    }
    throw error;
  }
};
