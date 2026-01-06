/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Filter items by distance from a point
 * @param {Array} items - Items with latitude and longitude properties
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Array} Filtered items with distance property added
 */
function filterByDistance(items, userLat, userLon, radiusKm) {
    return items
        .map(item => {
            const distance = calculateDistance(userLat, userLon, item.latitude, item.longitude);
            return { ...item, distance };
        })
        .filter(item => item.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}

module.exports = { calculateDistance, filterByDistance };
