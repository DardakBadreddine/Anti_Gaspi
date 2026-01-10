import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace this with your computer's local IP address
// Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: const BASE_URL = 'http://192.168.1.100:3000/api';
const BASE_URL = 'http://192.168.11.177:3000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
