import apiClient from './client';

/**
 * Get all categories
 */
export const getCategories = async () => {
    const response = await apiClient.get('/categories');
    return response.data;
};

/**
 * Get category by ID
 */
export const getCategory = async (categoryId) => {
    const response = await apiClient.get(`/categories/${categoryId}`);
    return response.data;
};
