import apiClient from './client';

/**
 * Search baskets by location and radius
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {number} radius - Search radius in km (default: 5)
 * @returns {Promise} API response with baskets array
 */
export const searchBaskets = async (lat, lng, radius = 5) => {
    const response = await apiClient.get('/baskets', {
        params: { lat, lng, radius },
    });
    return response.data;
};

/**
 * Get basket details by ID
 * @param {number} basketId - Basket ID
 * @returns {Promise} API response with basket details
 */
export const getBasketDetails = async (basketId) => {
    const response = await apiClient.get(`/baskets/${basketId}`);
    return response.data;
};

/**
 * Create a new basket (merchant only)
 * @param {Object} basketData - Basket data
 * @returns {Promise} API response
 */
export const createBasket = async (basketData) => {
    const response = await apiClient.post('/baskets', basketData);
    return response.data;
};

/**
 * Delete a basket (merchant only)
 * @param {number} basketId - Basket ID
 * @returns {Promise} API response
 */
export const deleteBasket = async (basketId) => {
    const response = await apiClient.delete(`/baskets/${basketId}`);
    return response.data;
};
