import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CountdownTimer from './CountdownTimer';
import { formatDistance } from '../utils/distance';

const FOOD_IMAGES = [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', // Bread
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&q=80', // Veggies
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', // Pizza/Meal
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80', // Pastry
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80', // Sandwich
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', // Salad
];

const BasketCard = ({ basket, onPress, showMerchantInfo = true }) => {
    const discount = Math.round(
        ((basket.original_price - basket.discounted_price) / basket.original_price) * 100
    );

    // Pick a deterministic random image based on ID
    const imageUri = FOOD_IMAGES[basket.id % FOOD_IMAGES.length];

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Image Container */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Overlay Badge for Quantity */}
                {basket.available_quantity < 3 && (
                    <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>Plus que {basket.available_quantity} !</Text>
                    </View>
                )}

                {/* Timer Badge positioned on image */}
                <View style={styles.timerBadge}>
                    <CountdownTimer expiresAt={basket.expires_at} compact />
                </View>
            </View>

            {/* Content Container */}
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title} numberOfLines={1}>{basket.title}</Text>
                        {showMerchantInfo && (
                            <Text style={styles.merchant}>
                                {basket.business_name} • {basket.distance ? formatDistance(basket.distance) : 'À proximité'}
                            </Text>
                        )}
                    </View>

                    {/* Merchant Avatar (Placeholder) */}
                    {showMerchantInfo && (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{basket.business_name?.substring(0, 1) || 'M'}</Text>
                        </View>
                    )}
                </View>

                {/* Price Row */}
                <View style={styles.footerRow}>
                    <View style={styles.priceBlock}>
                        <View style={styles.priceLeft}>
                            <Text style={styles.discountedPrice}>
                                {basket.discounted_price.toFixed(2)} €
                            </Text>
                            <Text style={styles.originalPrice}>
                                {basket.original_price.toFixed(2)} €
                            </Text>
                        </View>
                    </View>

                    <View style={styles.saveBadge}>
                        <Text style={styles.saveText}>-{discount}%</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        // iOS Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        // Android Shadow
        elevation: 4,
        overflow: 'hidden', // Ensures image respects borderRadius
    },
    imageContainer: {
        height: 160,
        width: '100%',
        backgroundColor: '#f3f4f6',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    urgentBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#ef4444',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    urgentText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
        lineHeight: 22,
    },
    merchant: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    priceBlock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLeft: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    discountedPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1f2937',
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 14,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    saveBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    saveText: {
        color: '#16a34a',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default BasketCard;
