import client from './client';

/**
 * Get user statistics
 */
export const getUserStats = async () => {
    const response = await client.get('/stats/user');
    return response.data;
};
