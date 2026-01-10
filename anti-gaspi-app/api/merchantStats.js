import client from './client';

/**
 * Get merchant statistics
 */
export const getMerchantStats = async () => {
    const response = await client.get('/stats/merchant');
    return response.data;
};
