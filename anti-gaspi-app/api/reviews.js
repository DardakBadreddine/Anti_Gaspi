import apiClient from './client';

/**
 * Get reviews for a merchant
 */
export const getMerchantReviews = async (merchantId) => {
    const response = await apiClient.get(`/reviews/merchant/${merchantId}`);
    return response.data;
};

/**
 * Get current user's reviews
 */
export const getUserReviews = async () => {
    const response = await apiClient.get('/reviews/user');
    return response.data;
};

/**
 * Create a review
 */
export const createReview = async (merchantId, rating, basketRating = null, comment = null, reservationId = null) => {
    const response = await apiClient.post('/reviews', {
        merchantId,
        rating,
        basketRating,
        comment,
        reservationId,
    });
    return response.data;
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
};
