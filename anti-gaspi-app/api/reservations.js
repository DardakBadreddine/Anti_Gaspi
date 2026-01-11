import apiClient from './client';

/**
 * Create a reservation for a basket
 * @param {number} basketId - Basket ID
 * @returns {Promise} API response with reservation and QR code
 */
export const createReservation = async (basketId) => {
    const response = await apiClient.post('/reservations', { basketId });
    return response.data;
};

/**
 * Get current user's reservations (customer only)
 * @returns {Promise} API response with reservations array
 */
export const getUserReservations = async () => {
    const response = await apiClient.get('/reservations/user');
    return response.data;
};

/**
 * Get merchant's reservations (merchant only)
 * @returns {Promise} API response with reservations array
 */
export const getMerchantReservations = async () => {
    const response = await apiClient.get('/reservations/merchant');
    return response.data;
};

/**
 * Validate a QR code (merchant only)
 * @param {string} qrCode - QR code to validate
 * @returns {Promise} API response
 */
export const validateReservation = async (qrCode) => {
    const response = await apiClient.post('/reservations/validate', { qrCode });
    return response.data;
};

/**
 * Cancel a reservation
 * @param {number} id - Reservation ID
 * @returns {Promise} API response
 */
export const cancelReservation = async (id) => {
    const response = await apiClient.patch(`/reservations/${id}/cancel`);
    return response.data;
};
