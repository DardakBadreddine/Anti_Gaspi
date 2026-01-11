// Replace localhost with 10.0.2.2 for Android emulator
export const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000/api'  // Android emulator
    : 'http://localhost:3000/api'  // iOS simulator
  : 'https://your-production-url.com/api';
