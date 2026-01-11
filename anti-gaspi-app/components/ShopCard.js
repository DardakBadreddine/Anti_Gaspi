import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ShopCard = ({ shop, onPress, onFavoriteToggle }) => {
    const {
        id,
        business_name,
        logo_url,
        cover_image_url,
        distance,
        rating,
        tagline,
        is_favorited,
        paniers
    } = shop;

    const panierCount = paniers?.length || 0;
    const soonestExpiry = paniers && paniers.length > 0
        ? new Date(paniers[0].expires_at)
        : null;

    // Get primary category from baskets to determine shop type
    const getPrimaryCategory = () => {
        if (!paniers || paniers.length === 0) return null;
        // Get the first category from the first basket
        const firstBasket = paniers[0];
        if (firstBasket.categories && firstBasket.categories.length > 0) {
            return firstBasket.categories[0];
        }
        return null;
    };

    const primaryCategory = getPrimaryCategory();

    // Get shop image - use cover_image_url if available, otherwise use logo_url, otherwise null
    const getShopImage = () => {
        if (cover_image_url) {
            return { uri: cover_image_url };
        }
        if (logo_url) {
            return { uri: logo_url };
        }
        // Return null to use the default placeholder
        return null;
    };

    const shopImage = getShopImage();

    const getTimeRemaining = () => {
        if (!soonestExpiry) return null;

        const now = new Date();
        const diff = soonestExpiry - now;

        if (diff <= 0) return 'Expiré';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `Expire dans ${hours}h`;
        }
        return `Expire dans ${minutes}m`;
    };

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(shop)} activeOpacity={0.7}>
            {/* Shop Image */}
            {shopImage ? (
                <Image 
                    source={shopImage} 
                    style={styles.shopImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.shopImagePlaceholder}>
                    <Ionicons name="storefront" size={48} color="#22c55e" />
                </View>
            )}
            
            <View style={styles.header}>
                {/* Logo/Avatar */}
                <View style={styles.avatar}>
                    {logo_url ? (
                        <Image 
                            source={{ uri: logo_url }} 
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[
                            { backgroundColor: (primaryCategory?.color || '#22c55e') + '20' }
                        ]}>
                            <Text style={styles.avatarIcon}>
                                {primaryCategory?.icon || '🏪'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Shop Info */}
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {business_name}
                    </Text>

                    <View style={styles.meta}>
                        {rating > 0 && (
                            <View style={styles.rating}>
                                <Ionicons name="star" size={14} color="#f59e0b" />
                                <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
                                <Text style={styles.metaDivider}>•</Text>
                            </View>
                        )}
                        <Text style={styles.distance}>{(distance || 0).toFixed(1)} km</Text>
                    </View>

                    {tagline && (
                        <Text style={styles.tagline} numberOfLines={1}>
                            {tagline}
                        </Text>
                    )}
                </View>

                {/* Favorite Button */}
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onFavoriteToggle(id);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={[
                        styles.favoriteButtonBackground,
                        is_favorited && styles.favoriteButtonBackgroundActive
                    ]}>
                        <Ionicons
                            name={is_favorited ? 'heart' : 'heart-outline'}
                            size={20}
                            color={is_favorited ? '#ef4444' : '#8E8E93'}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Panier Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Ionicons name="basket" size={16} color="#22c55e" />
                    <Text style={styles.summaryText}>
                        {panierCount} panier{panierCount !== 1 ? 's' : ''} disponible{panierCount !== 1 ? 's' : ''}
                    </Text>
                </View>

                {soonestExpiry && (
                    <View style={styles.summaryItem}>
                        <Ionicons name="time-outline" size={16} color="#f59e0b" />
                        <Text style={styles.expiryText}>{getTimeRemaining()}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    shopImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#F2F2F7',
    },
    shopImagePlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopImageIcon: {
        fontSize: 64,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#F2F2F7',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarIcon: {
        fontSize: 28,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginLeft: 4,
    },
    metaDivider: {
        fontSize: 14,
        color: '#8E8E93',
        marginHorizontal: 6,
    },
    distance: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    tagline: {
        fontSize: 14,
        color: '#8E8E93',
        fontStyle: 'italic',
    },
    favoriteButton: {
        padding: 8,
    },
    favoriteButtonBackground: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButtonBackgroundActive: {
        backgroundColor: '#fee2e2',
    },
    summary: {
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    expiryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#f59e0b',
    },
});

export default ShopCard;
