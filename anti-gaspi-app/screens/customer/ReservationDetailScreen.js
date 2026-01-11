import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cancelReservation } from '../../api/reservations';
import Button from '../../components/Button';
import CountdownTimer from '../../components/CountdownTimer';

const ReservationDetailScreen = ({ route, navigation }) => {
    const { reservation } = route.params;
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);

    // Initial state from params, but could be refreshed if needed
    const [item, setItem] = useState(reservation);

    const isPending = item.status === 'pending';
    const isExpired = new Date(item.expires_at) <= new Date();
    const isCollected = item.status === 'collected';
    const isCancelled = item.status === 'cancelled';

    const handleCancel = () => {
        Alert.alert(
            'Annuler la réservation',
            'Êtes-vous sûr de vouloir annuler cette réservation ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await cancelReservation(item.id);
                            Alert.alert('Succès', 'Réservation annulée');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Erreur', error.response?.data?.error || 'Impossible d\'annuler');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openMaps = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${item.latitude},${item.longitude}`;
        const label = item.business_name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    const handleCall = () => {
        if (item.phone) {
            Linking.openURL(`tel:${item.phone}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Custom Header with Back Button */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails réservation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Status Card */}
                <View style={styles.statusCard}>
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
                            {isCollected ? 'Récupéré' : isCancelled ? 'Annulé' : 'En attente de récupération'}
                        </Text>
                    </View>

                    {isPending && !isExpired && (
                        <View style={styles.timerContainer}>
                            <Text style={styles.timerLabel}>Expire dans:</Text>
                            <CountdownTimer expiresAt={item.expires_at} style={styles.timer} />
                        </View>
                    )}
                </View>

                {/* QR Code Section - Only if pending */}
                {isPending && !isExpired && (
                    <View style={styles.qrSection}>
                        <Text style={styles.qrTitle}>Code de retrait</Text>
                        <Text style={styles.qrSubtitle}>Présentez ce code au commerçant</Text>
                        <View style={styles.qrWrapper}>
                            <QRCode value={item.qr_code} size={200} />
                        </View>
                        <Text style={styles.codeText}>{item.qr_code}</Text>
                    </View>
                )}

                {/* Order Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Votre Panier</Text>
                    <Text style={styles.basketTitle}>{item.title}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{(item.discounted_price || 0).toFixed(2)} €</Text>
                        {item.original_price && (
                            <Text style={styles.originalPrice}>{Number(item.original_price).toFixed(2)} €</Text>
                        )}
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                -{Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100)}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Merchant & Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Commerçant</Text>
                    <View style={styles.merchantInfo}>
                        <View style={styles.merchantHeader}>
                            <Ionicons name="storefront" size={24} color="#22c55e" />
                            <Text style={styles.merchantName}>{item.business_name}</Text>
                        </View>
                        <Text style={styles.address}>{item.address}</Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionBtn} onPress={openMaps}>
                                <Ionicons name="navigate-outline" size={20} color="#22c55e" />
                                <Text style={styles.actionBtnText}>Itinéraire</Text>
                            </TouchableOpacity>
                            {item.phone && (
                                <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                                    <Ionicons name="call-outline" size={20} color="#22c55e" />
                                    <Text style={styles.actionBtnText}>Appeler</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Mini Map */}
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: item.latitude,
                                longitude: item.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            liteMode={true}
                        >
                            <Marker
                                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                                title={item.business_name}
                            />
                        </MapView>
                    </View>
                </View>

                {/* Cancel Button */}
                {isPending && !isExpired && (
                    <Button
                        title="Annuler la réservation"
                        onPress={handleCancel}
                        loading={loading}
                        style={styles.cancelMainButton}
                        textStyle={{ color: '#ef4444' }}
                        variant="outline" // Assuming an outline variant exists or style overrides
                    />
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        marginBottom: 12,
    },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusCollected: { backgroundColor: '#DCFCE7' },
    statusCancelled: { backgroundColor: '#FEE2E2' },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    statusTextPending: { color: '#B45309' },
    statusTextCollected: { color: '#15803D' },
    statusTextCancelled: { color: '#B91C1C' },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timerLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    qrSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    qrTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    qrSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    qrWrapper: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 16,
    },
    codeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        letterSpacing: 2,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    basketTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        color: '#22c55e',
    },
    originalPrice: {
        fontSize: 16,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#15803D',
    },
    merchantInfo: {
        marginBottom: 16,
    },
    merchantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    merchantName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    address: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    actionBtnText: {
        color: '#22c55e',
        fontWeight: '600',
        fontSize: 14,
    },
    mapContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    cancelMainButton: {
        marginTop: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
});

export default ReservationDetailScreen;
