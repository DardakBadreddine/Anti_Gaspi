import axios from 'axios';
import { Platform } from 'react-native';

// Android emulator needs 10.0.2.2 to access localhost
const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
