import * as Location from 'expo-location';

/**
 * Request location permissions
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

/**
 * Get current user location
 * @returns {Promise<Object>} Location object with latitude and longitude
 */
export const getCurrentLocation = async () => {
    // 🧪 TEST MODE: Set to true to use fixed Paris coordinates for testing
    const TEST_MODE = true;

    if (TEST_MODE) {
        console.log('🧪 TEST MODE: Using fixed Paris coordinates');
        return {
            latitude: 48.8566,
            longitude: 2.3522,
        };
    }

    try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            throw new Error('Permission de localisation refusée');
        }

        // Try to get last known position first (faster)
        let location = await Location.getLastKnownPositionAsync({});

        // If no last known position, request current position
        if (!location) {
            location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 10000,
            });
        }

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error('Error getting location:', error);
        throw error;
    }
};
