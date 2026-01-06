import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBasketDetails } from '../../api/baskets';
import { createReservation } from '../../api/reservations';
import CountdownTimer from '../../components/CountdownTimer';
import Button from '../../components/Button';
import { formatDistance } from '../../utils/distance';

const FOOD_IMAGES = [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
];

const BasketDetailsScreen = ({ route, navigation }) => {
    const { basketId } = route.params;
    const insets = useSafeAreaInsets();
    const [basket, setBasket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);

    useEffect(() => {
        loadBasketDetails();
    }, []);

    const loadBasketDetails = async () => {
        try {
            const result = await getBasketDetails(basketId);
            setBasket(result.basket);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger les détails du panier');
            navigation.goBack();
        }
        setLoading(false);
    };

    const handleReserve = async () => {
        Alert.alert(
            'Confirmer la réservation',
            'Vous aurez 1 heure pour récupérer ce panier. Le paiement se fait sur place.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Réserver',
                    onPress: async () => {
                        setReserving(true);
                        try {
                            await createReservation(basketId);
                            Alert.alert(
                                'Félicitations ! 🎉',
                                'Votre panier est réservé. Retrouvez votre QR Code dans l\'onglet Réservations.',
                                [
                                    {
                                        text: 'Voir mon QR Code',
                                        // FIX: Navigate to nested screen
                                        onPress: () => navigation.navigate('CustomerHome', { screen: 'Reservations' }),
                                    },
                                ]
                            );
                        } catch (error) {
                            const errorMsg =
                                error.response?.data?.error || 'Erreur lors de la réservation';
                            Alert.alert('Oups', errorMsg);
                        }
                        setReserving(false);
                    },
                },
            ]
        );
    };

    if (loading || !basket) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    const discount = Math.round(
        ((basket.original_price - basket.discounted_price) / basket.original_price) * 100
    );
    const imageUri = FOOD_IMAGES[basketId % FOOD_IMAGES.length];

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                    <View style={styles.imageOverlay} />

                    {/* Header Actions */}
                    <View style={[styles.headerActions, { top: insets.top + 10 }]}>
                        {/* Back button is handled by Stack Header usually, but if we wanted custom transparent header... */}
                    </View>

                    <View style={styles.timerBadge}>
                        <CountdownTimer expiresAt={basket.expires_at} compact />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>{basket.title}</Text>
                        </View>
                        <Text style={styles.merchant}>
                            {basket.business_name} • {basket.distance ? formatDistance(basket.distance) : 'À proximité'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Price & Value */}
                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>Prix à payer</Text>
                            <Text style={styles.bigPrice}>{basket.discounted_price.toFixed(2)} €</Text>
                        </View>
                        <View style={styles.valueBox}>
                            <Text style={styles.originalPrice}>Valeur: {basket.original_price.toFixed(2)} €</Text>
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>Économie -{discount}%</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    {basket.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ce que vous aurez</Text>
                            <Text style={styles.description}>{basket.description}</Text>
                        </View>
                    )}

                    {/* Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informations pratiques</Text>

                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={20} color="#6b7280" />
                            <Text style={styles.infoText}>{basket.address || 'Adresse non communiquée'}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="cube-outline" size={20} color="#6b7280" />
                            <Text style={styles.infoText}>
                                {basket.available_quantity} panier{basket.available_quantity > 1 ? 's' : ''} restant{basket.available_quantity > 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <Button
                    title={`Réserver pour ${basket.discounted_price.toFixed(2)} €`}
                    onPress={handleReserve}
                    loading={reserving}
                    disabled={basket.available_quantity <= 0}
                    style={styles.reserveButton}
                    textStyle={{ fontSize: 18, fontWeight: '700' }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        height: 250,
        backgroundColor: '#f3f4f6',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    timerBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    content: {
        padding: 24,
        marginTop: -20, // Overlap image
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    merchant: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    bigPrice: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1f2937',
    },
    valueBox: {
        alignItems: 'flex-end',
    },
    originalPrice: {
        fontSize: 16,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
        marginBottom: 4,
    },
    saveBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    saveText: {
        color: '#16a34a',
        fontWeight: '700',
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 24,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#4b5563',
        flex: 1,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // Shadow for sticky footer
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    reserveButton: {
        width: '100%',
        borderRadius: 16,
        height: 56,
    },
});

export default BasketDetailsScreen;
