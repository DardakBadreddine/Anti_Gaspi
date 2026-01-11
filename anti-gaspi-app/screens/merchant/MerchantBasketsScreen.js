import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getMerchantBaskets, deleteBasket } from '../../api/baskets';
import CountdownTimer from '../../components/CountdownTimer';
import Button from '../../components/Button';

const MerchantBasketsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadBaskets();
        }, [])
    );

    const loadBaskets = async () => {
        setLoading(true);
        try {
            const result = await getMerchantBaskets();
            setBaskets(result.baskets || []);
        } catch (error) {
            console.error('Error loading baskets:', error);
            Alert.alert('Erreur', 'Impossible de charger vos paniers');
        }
        setLoading(false);
    };

    const handleDelete = (basketId, title) => {
        Alert.alert(
            'Supprimer le panier',
            `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteBasket(basketId);
                            Alert.alert('Succès', 'Panier supprimé');
                            loadBaskets();
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de supprimer le panier');
                        }
                    },
                },
            ]
        );
    };

    const renderBasket = ({ item }) => {
        const discount = Math.round(
            ((item.original_price - item.discounted_price) / item.original_price) * 100
        );

        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.description && (
                            <Text style={styles.description} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                    </View>
                    <CountdownTimer expiresAt={item.expires_at} />
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>€{item.original_price.toFixed(2)}</Text>
                    <Text style={styles.discountedPrice}>€{item.discounted_price.toFixed(2)}</Text>
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discount}%</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.quantity}>
                        {item.available_quantity}/{item.quantity} disponible{item.available_quantity > 1 ? 's' : ''}
                    </Text>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.title)}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        <Text style={styles.deleteText}>Supprimer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
                {/* Cover Image */}
                {user?.cover_image_url ? (
                    <Image 
                        source={{ uri: user.cover_image_url }} 
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.coverImagePlaceholder} />
                )}
                
                {/* Logo/Avatar */}
                <View style={styles.logoContainer}>
                    {user?.logo_url ? (
                        <Image 
                            source={{ uri: user.logo_url }} 
                            style={styles.logo}
                        />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Ionicons name="storefront" size={32} color="#22c55e" />
                        </View>
                    )}
                </View>
                
                <Text style={styles.headerTitle}>{user?.business_name || 'Mes Paniers'}</Text>
                <Text style={styles.headerSubtitle}>
                    {baskets.length} panier{baskets.length !== 1 ? 's' : ''} actif{baskets.length !== 1 ? 's' : ''}
                </Text>
                <Button
                    title="+ Nouveau panier"
                    onPress={() => navigation.navigate('AddBasket')}
                    style={styles.addButton}
                />
            </View>

            <FlatList
                data={baskets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBasket}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: 100 }
                ]}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadBaskets} tintColor="#22c55e" />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="basket-outline" size={64} color="#E5E5EA" />
                            <Text style={styles.emptyTitle}>Aucun panier actif</Text>
                            <Text style={styles.emptySubtitle}>
                                Créez votre premier panier anti-gaspi
                            </Text>
                            <Button
                                title="Ajouter un panier"
                                onPress={() => navigation.navigate('AddBasket')}
                                style={styles.emptyButton}
                            />
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
    headerContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 120,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    coverImagePlaceholder: {
        width: '100%',
        height: 120,
        backgroundColor: '#f0fdf4',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 12,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
        marginTop: 4,
        marginBottom: 16,
    },
    addButton: {
        marginBottom: 0,
    },
    listContent: {
        padding: 16,
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    originalPrice: {
        fontSize: 14,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discountedPrice: {
        fontSize: 22,
        fontWeight: '700',
        color: '#22c55e',
        marginRight: 8,
    },
    discountBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#16a34a',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    quantity: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    deleteText: {
        fontSize: 14,
        color: '#ef4444',
        fontWeight: '600',
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
        marginBottom: 24,
    },
    emptyButton: {
        minWidth: 200,
    },
});

export default MerchantBasketsScreen;
