import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure based on device type:
// - Android Emulator: Use 10.0.2.2 (special emulator address)
// - Physical Device / Expo Go: Use your machine's IP address
// - iOS Simulator: Use localhost
//
// To find your IP: Run 'ipconfig' on Windows and look for IPv4 Address
// Current IP: 192.168.11.128
// Universal IP for all devices (Android Emulator, iOS Simulator, Physical Devices)
// Ensure your phone is on the same WiFi network.
const SERVER_IP = '192.168.11.128';
const BASE_URL = `http://${SERVER_IP}:3000/api`;

console.log('🌐 API Base URL:', BASE_URL);
console.log('📱 Platform:', Platform.OS);

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
