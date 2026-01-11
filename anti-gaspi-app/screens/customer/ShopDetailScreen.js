import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Alert,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PanierCard from '../../components/BasketCard';
import Button from '../../components/Button';
import { addFavorite, removeFavorite } from '../../api/favorites';

const ShopDetailScreen = ({ route, navigation }) => {
    const { shopId, shop: initialShop } = route.params;
    const insets = useSafeAreaInsets();
    const [shop, setShop] = useState(initialShop);
    const [loading, setLoading] = useState(false);

    const handleFavoriteToggle = async () => {
        try {
            if (shop.is_favorited) {
                await removeFavorite(shop.id);
            } else {
                await addFavorite(shop.id);
            }

            setShop({ ...shop, is_favorited: !shop.is_favorited });
        } catch (error) {
            console.error('Error toggling favorite:', error);
            Alert.alert('Erreur', 'Impossible de modifier les favoris');
        }
    };

    const handleCall = () => {
        if (shop.phone) {
            Linking.openURL(`tel:${shop.phone}`);
        }
    };

    const handleDirections = () => {
        const url = Platform.OS === 'ios'
            ? `maps://app?daddr=${shop.latitude},${shop.longitude}`
            : `geo:0,0?q=${shop.latitude},${shop.longitude}(${shop.business_name})`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de cartes');
        });
    };

    const handleReserve = (panierId) => {
        navigation.navigate('BasketDetails', { basketId: panierId });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {shop.business_name}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoriteToggle}
                >
                    <Ionicons
                        name={shop.is_favorited ? 'heart' : 'heart-outline'}
                        size={24}
                        color={shop.is_favorited ? '#ef4444' : '#000'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            >
                {/* Shop Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="storefront" size={48} color="#22c55e" />
                    </View>

                    <View style={styles.metaRow}>
                        {shop.rating > 0 && (
                            <View style={styles.metaItem}>
                                <Ionicons name="star" size={16} color="#f59e0b" />
                                <Text style={styles.metaText}>
                                    {(shop.rating || 0).toFixed(1)} (12 avis)
                                </Text>
                            </View>
                        )}
                    </View>

                    {shop.tagline && (
                        <Text style={styles.tagline}>"{shop.tagline}"</Text>
                    )}

                    {shop.address && (
                        <View style={styles.addressRow}>
                            <Ionicons name="location" size={16} color="#8E8E93" />
                            <Text style={styles.addressText}>
                                {(shop.distance || 0).toFixed(1)} km • {shop.address}
                            </Text>
                        </View>
                    )}

                    {shop.phone && (
                        <View style={styles.addressRow}>
                            <Ionicons name="call" size={16} color="#8E8E93" />
                            <Text style={styles.addressText}>{shop.phone}</Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
                            <Ionicons name="navigate" size={20} color="#22c55e" />
                            <Text style={styles.actionButtonText}>Itinéraire</Text>
                        </TouchableOpacity>

                        {shop.phone && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                                <Ionicons name="call" size={20} color="#22c55e" />
                                <Text style={styles.actionButtonText}>Appeler</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Paniers Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Paniers disponibles ({shop.paniers?.length || 0})
                    </Text>

                    {shop.paniers && shop.paniers.length > 0 ? (
                        shop.paniers.map((panier) => (
                            <PanierCard
                                key={panier.id}
                                basket={panier}
                                onPress={() => handleReserve(panier.id)}
                                showMerchantInfo={false}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyPaniers}>
                            <Ionicons name="basket-outline" size={48} color="#E5E5EA" />
                            <Text style={styles.emptyText}>Aucun panier disponible</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    favoriteButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    infoCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    tagline: {
        fontSize: 16,
        color: '#8E8E93',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 16,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#8E8E93',
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    emptyPaniers: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 12,
    },
});

export default ShopDetailScreen;
