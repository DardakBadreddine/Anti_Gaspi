import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Automatically detect the API base URL
 * Priority:
 * 1. Environment variable (for production)
 * 2. Expo dev server hostname (for development)
 * 3. Platform-specific defaults
 */
const getApiBaseUrl = () => {
    // Production: Use environment variable if set
    if (process.env.EXPO_PUBLIC_API_URL) {
        console.log('📦 Using production API URL from environment');
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Development: Extract IP from Expo dev server
    // Try multiple sources for hostUri (different Expo versions)
    const hostUri = 
        Constants.expoConfig?.hostUri || 
        Constants.manifest?.hostUri || 
        Constants.manifest?.debuggerHost ||
        Constants.manifest2?.extra?.expoGo?.hostUri;

    if (hostUri) {
        // Extract IP address from hostUri (format: "192.168.1.100:8081" or "192.168.1.100")
        const ipMatch = hostUri.match(/^(\d+\.\d+\.\d+\.\d+)/);
        if (ipMatch) {
            const serverIp = ipMatch[1];
            const apiUrl = `http://${serverIp}:3000/api`;
            console.log('🔍 Auto-detected API URL from Expo:', apiUrl);
            return apiUrl;
        }
    }

    // Fallback: Platform-specific defaults
    if (Platform.OS === 'android') {
        // Android emulator uses special address to access host machine
        console.log('📱 Using Android emulator default');
        return 'http://10.0.2.2:3000/api';
    } else if (Platform.OS === 'ios') {
        // iOS simulator can use localhost
        console.log('📱 Using iOS simulator default');
        return 'http://localhost:3000/api';
    }

    // Last resort: Try localhost
    console.log('⚠️ Using localhost fallback');
    return 'http://localhost:3000/api';
};

const BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🔧 Expo Host URI:', Constants.expoConfig?.hostUri || Constants.manifest?.hostUri || 'Not available');

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
        console.log('📤 Making request to:', config.baseURL + config.url);
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
    (response) => {
        console.log('✅ Response received:', response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('❌ Network Error - No response received');
            console.error('Request was made to:', error.config?.url);
        } else {
            console.error('❌ Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
