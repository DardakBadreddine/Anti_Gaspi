import client from './client';

/**
 * Submit a review for a merchant
 */
export const submitReview = async (reservationId, rating, comment) => {
    const response = await client.post('/reviews', {
        reservationId,
        rating,
        comment
    });
    return response.data;
};

/**
 * Get reviews for a merchant
 */
export const getMerchantReviews = async (merchantId) => {
    const response = await client.get(`/reviews/merchant/${merchantId}`);
    return response.data;
};

/**
 * Get merchant's average rating
 */
export const getMerchantRating = async (merchantId) => {
    const response = await client.get(`/reviews/merchant/${merchantId}/rating`);
    return response.data;
};

/**
 * Get pending reviews (collected reservations not yet reviewed)
 */
export const getPendingReviews = async () => {
    const response = await client.get('/reviews/pending');
    return response.data;
};
