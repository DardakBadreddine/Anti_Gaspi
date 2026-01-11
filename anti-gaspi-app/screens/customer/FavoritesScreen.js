import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, removeFavorite } from '../../api/favorites';

const FavoritesScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const data = await getFavorites();
            setFavorites(data.favorites || []);
        } catch (error) {
            console.error('Error loading favorites:', error);
            Alert.alert('Erreur', 'Impossible de charger vos favoris');
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const handleRemoveFavorite = async (merchantId) => {
        try {
            await removeFavorite(merchantId);
            setFavorites(favorites.filter(f => f.merchant_id !== merchantId));
        } catch (error) {
            console.error('Error removing favorite:', error);
            Alert.alert('Erreur', 'Impossible de retirer ce favori');
        }
    };

    const confirmRemove = (merchant) => {
        Alert.alert(
            'Retirer des favoris',
            `Voulez-vous retirer ${merchant.business_name} de vos favoris?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Retirer',
                    style: 'destructive',
                    onPress: () => handleRemoveFavorite(merchant.merchant_id),
                },
            ]
        );
    };

    const handleCall = (phone) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    const handleDirections = (lat, lng, label) => {
        const url = Platform.OS === 'ios'
            ? `maps://app?daddr=${lat},${lng}`
            : `geo:0,0?q=${lat},${lng}(${label})`;
        Linking.openURL(url);
    };

    const renderMerchantCard = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ShopDetail', { shopId: item.merchant_id, shop: { ...item, id: item.merchant_id } })}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Ionicons name="storefront" size={32} color="#22c55e" />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.merchantName}>{item.business_name}</Text>
                        {item.tagline && (
                            <Text style={styles.tagline} numberOfLines={1}>{item.tagline}</Text>
                        )}
                        {item.rating > 0 && (
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#f59e0b" />
                                <Text style={styles.rating}>{Number(item.rating).toFixed(1)}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => confirmRemove(item)}
                    >
                        <Ionicons name="heart" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {item.address && (
                    <View style={styles.addressContainer}>
                        <Ionicons name="location" size={16} color="#8E8E93" />
                        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                    </View>
                )}

                <View style={styles.actionFooter}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDirections(item.latitude, item.longitude, item.business_name)}
                    >
                        <Ionicons name="navigate-outline" size={18} color="#22c55e" />
                        <Text style={styles.actionButtonText}>Itinéraire</Text>
                    </TouchableOpacity>

                    {item.phone && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleCall(item.phone)}
                        >
                            <Ionicons name="call-outline" size={18} color="#22c55e" />
                            <Text style={styles.actionButtonText}>Appeler</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.title}>Favoris</Text>
                <Text style={styles.subtitle}>
                    {favorites.length} commerçant{favorites.length !== 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMerchantCard}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: 100 + insets.bottom }
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#22c55e"
                    />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-outline" size={64} color="#E5E5EA" />
                            <Text style={styles.emptyTitle}>Aucun favori</Text>
                            <Text style={styles.emptySubtitle}>
                                Suivez vos commerces préférés pour être notifié de leurs nouveaux paniers.
                            </Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        backgroundColor: '#fff',
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
        marginTop: 4,
    },
    listContent: {
        padding: 20,
        paddingTop: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    merchantName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    favoriteButton: {
        padding: 8,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    address: {
        fontSize: 14,
        color: '#8E8E93',
        flex: 1,
    },
    actionFooter: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
    },
});

export default FavoritesScreen;
