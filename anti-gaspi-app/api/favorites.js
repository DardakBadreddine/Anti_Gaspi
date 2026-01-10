import client from './client';

/**
 * Add merchant to favorites
 */
export const addFavorite = async (merchantId) => {
    const response = await client.post(`/favorites/${merchantId}`);
    return response.data;
};

/**
 * Remove merchant from favorites
 */
export const removeFavorite = async (merchantId) => {
    const response = await client.delete(`/favorites/${merchantId}`);
    return response.data;
};

/**
 * Get user's favorite merchants with their active baskets
 */
export const getFavorites = async () => {
    const response = await client.get('/favorites');
    return response.data;
};

/**
 * Check if merchant is in user's favorites
 */
export const checkFavorite = async (merchantId) => {
    const response = await client.get(`/favorites/check/${merchantId}`);
    return response.data;
};
