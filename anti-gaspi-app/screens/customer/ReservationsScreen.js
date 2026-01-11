import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    Modal,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { getUserReservations, cancelReservation } from '../../api/reservations';
import CountdownTimer from '../../components/CountdownTimer';
import Button from '../../components/Button';

const ReservationsScreen = ({ navigation }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadReservations();
        }, [])
    );

    const loadReservations = async () => {
        setLoading(true);
        try {
            const result = await getUserReservations();
            setReservations(result.reservations || []);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger les réservations');
        }
        setLoading(false);
    };

    const handleCancel = (reservationId) => {
        Alert.alert(
            'Annuler la réservation',
            'Êtes-vous sûr de vouloir annuler cette réservation ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelReservation(reservationId);
                            loadReservations(); // Reload list
                            Alert.alert('Succès', 'Réservation annulée');
                        } catch (error) {
                            Alert.alert('Erreur', error.response?.data?.error || 'Impossible d\'annuler');
                        }
                    }
                }
            ]
        );
    };

    const openMaps = (lat, lng, label) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    const renderReservation = ({ item }) => {
        const isPending = item.status === 'pending';
        const isExpired = new Date(item.expires_at) <= new Date();
        const isCancelled = item.status === 'cancelled';
        const isCollected = item.status === 'collected';

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ReservationDetail', { reservation: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={[
                        styles.statusBadge,
                        isCollected && styles.statusCollected,
                        isPending && styles.statusPending,
                        isCancelled && styles.statusCancelled
                    ]}>
                        <Text style={[
                            styles.statusText,
                            isCollected && styles.statusTextCollected,
                            isPending && styles.statusTextPending,
                            isCancelled && styles.statusTextCancelled
                        ]}>
                            {isCollected ? 'Récupéré' : isCancelled ? 'Annulé' : 'En attente'}
                        </Text>
                    </View>
                    {isPending && !isExpired && (
                        <View style={styles.timerBadge}>
                            <Ionicons name="time-outline" size={14} color="#92400e" />
                            <CountdownTimer expiresAt={item.expires_at} />
                        </View>
                    )}
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.merchant} numberOfLines={1}>{item.business_name}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>€{(item.discounted_price || 0).toFixed(2)}</Text>
                        {item.original_price && (
                            <Text style={styles.originalPrice}>€{Number(item.original_price).toFixed(2)}</Text>
                        )}
                    </View>

                    <View style={styles.addressRow}>
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                    </View>
                </View>

                <View style={styles.miniFooter}>
                    <Text style={styles.viewDetailsText}>Voir le QR Code et détails</Text>
                    <Ionicons name="chevron-forward" size={16} color="#22c55e" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Mes Réservations</Text>
                </View>
            </View>

            <FlatList
                data={reservations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReservation}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadReservations} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>📦</Text>
                            <Text style={styles.emptyTitle}>Aucune réservation</Text>
                            <Text style={styles.emptySubtitle}>
                                Vos paniers réservés apparaîtront ici
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
        backgroundColor: '#F3F4F6', // Lighter background
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 60,
        // Removed heavy shadow/radius for cleaner look
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusCollected: { backgroundColor: '#DCFCE7' },
    statusCancelled: { backgroundColor: '#FEE2E2' },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    statusTextPending: { color: '#B45309' },
    statusTextCollected: { color: '#15803D' },
    statusTextCancelled: { color: '#B91C1C' },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cardBody: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    merchant: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: '#059669',
    },
    originalPrice: {
        fontSize: 14,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    address: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
    },
    miniFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
    },
});

export default ReservationsScreen;
