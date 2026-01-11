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
/**
 * Get address from coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Formatted address or null
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;

        const result = await Location.reverseGeocodeAsync({ latitude, longitude });

        if (result && result.length > 0) {
            const { street, city, region, postalCode, country } = result[0];
            const parts = [
                street,
                postalCode,
                city,
                // region, // Often too verbose or duplicate
                // country // Assumed local for now
            ].filter(part => part); // Remove null/undefined

            return parts.join(', ');
        }
        return null;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
};

export const getCurrentLocation = async () => {
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
