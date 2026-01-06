import apiClient from './client';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} API response
 */
export const register = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} API response with token and user data
 */
export const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
};

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise} API response with updated user
 */
export const updateProfile = async (userData) => {
    const response = await apiClient.put('/auth/update', userData);
    return response.data;
};

/**
 * Delete user account
 * @returns {Promise} API response
 */
export const deleteAccount = async () => {
    const response = await apiClient.delete('/auth/delete');
    return response.data;
};
