import apiClient from './client';

/**
 * Get user's favorite merchants
 */
export const getFavorites = async () => {
    const response = await apiClient.get('/favorites');
    return response.data;
};

/**
 * Add merchant to favorites
 */
export const addFavorite = async (merchantId) => {
    const response = await apiClient.post('/favorites', {
        merchant_id: merchantId,
    });
    return response.data;
};

/**
 * Remove merchant from favorites
 */
export const removeFavorite = async (merchantId) => {
    const response = await apiClient.delete(`/favorites/${merchantId}`);
    return response.data;
};

/**
 * Check if merchant is favorited
 */
export const checkFavorite = async (merchantId) => {
    const response = await apiClient.get(`/favorites/check/${merchantId}`);
    return response.data;
};
