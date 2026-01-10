import apiClient from './client';

/**
 * Search baskets by location and radius with optional filters
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {number} radius - Search radius in km (default: 5)
 * @param {Object} filters - Optional filters {category, minPrice, maxPrice, sortBy}
 * @returns {Promise} API response with baskets array
 */
export const searchBaskets = async (lat, lng, radius = 5, filters = {}) => {
    const params = { lat, lng, radius, ...filters };
    const response = await apiClient.get('/baskets', { params });
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
    console.log('📤 Sending basket data:', basketData);
    const response = await apiClient.post('/baskets', basketData);
    console.log('📥 Received response:', response.data);
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
