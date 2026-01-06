import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchBaskets, deleteBasket } from '../../api/baskets';
import { useAuth } from '../../contexts/AuthContext';
import CountdownTimer from '../../components/CountdownTimer';
import Button from '../../components/Button';
import ProfileHeaderButton from '../../components/ProfileHeaderButton';

const MerchantBasketsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBaskets();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadBaskets();
        });
        return unsubscribe;
    }, [navigation]);

    const loadBaskets = async () => {
        setLoading(true);
        try {
            // For merchants, we get baskets at their location with a large radius
            const result = await searchBaskets(0, 0, 10000);
            setBaskets(result.baskets || []);
        } catch (error) {
            console.error('Error loading baskets:', error);
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
                        <Text style={styles.deleteText}>🗑️ Supprimer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Mes Paniers</Text>
                    <ProfileHeaderButton />
                </View>
                <Button
                    title="+ Ajouter un panier"
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
                    <RefreshControl refreshing={loading} onRefresh={loadBaskets} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>📦</Text>
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
        backgroundColor: '#f9fafb',
    },
    headerContainer: {
        backgroundColor: '#fff',
        padding: 20,
        // paddingTop dynamic
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
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
        color: '#1f2937',
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
    },
    deleteButton: {
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
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        minWidth: 200,
    },
});

export default MerchantBasketsScreen;
