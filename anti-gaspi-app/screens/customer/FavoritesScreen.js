import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites } from '../../api/favorites';
import StarRating from '../../components/StarRating';

const FavoritesScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const result = await getFavorites();
            setFavorites(result.favorites);
        } catch (error) {
            console.error('Load favorites error:', error);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadFavorites();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>Aucun favori</Text>
                <Text style={styles.emptyText}>
                    Ajoutez des commerçants à vos favoris pour les retrouver facilement
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Favoris</Text>
            </View>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.merchant_id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                renderItem={({ item }) => (
                    <View style={styles.merchantCard}>
                        <View style={styles.merchantInfo}>
                            <Text style={styles.merchantName}>{item.business_name}</Text>
                            <Text style={styles.merchantAddress}>{item.address}</Text>
                            <View style={styles.ratingRow}>
                                <StarRating rating={item.average_rating} size={14} />
                                <Text style={styles.ratingText}>
                                    ({item.review_count} avis)
                                </Text>
                            </View>
                        </View>
                        {item.active_baskets.length > 0 ? (
                            <View style={styles.basketsContainer}>
                                <Text style={styles.basketsLabel}>
                                    {item.active_baskets.length} panier{item.active_baskets.length > 1 ? 's' : ''} disponible{item.active_baskets.length > 1 ? 's' : ''}
                                </Text>
                                {item.active_baskets.slice(0, 2).map((basket) => (
                                    <TouchableOpacity
                                        key={basket.id}
                                        style={styles.basketRow}
                                        onPress={() =>
                                            navigation.navigate('BasketDetails', { basketId: basket.id })
                                        }
                                    >
                                        <Text style={styles.basketTitle} numberOfLines={1}>
                                            {basket.title}
                                        </Text>
                                        <Text style={styles.basketPrice}>
                                            {basket.discounted_price.toFixed(2)} €
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.noBaskets}>Aucun panier disponible</Text>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
    },
    merchantCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    merchantInfo: {
        marginBottom: 12,
    },
    merchantName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    merchantAddress: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingText: {
        fontSize: 12,
        color: '#6b7280',
    },
    basketsContainer: {
        marginTop: 8,
    },
    basketsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#22c55e',
        marginBottom: 8,
    },
    basketRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    basketTitle: {
        fontSize: 14,
        color: '#1f2937',
        flex: 1,
    },
    basketPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#22c55e',
    },
    noBaskets: {
        fontSize: 14,
        color: '#9ca3af',
        fontStyle: 'italic',
    },
});

export default FavoritesScreen;
