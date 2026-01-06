import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    Modal,
    TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getUserReservations } from '../../api/reservations';
import CountdownTimer from '../../components/CountdownTimer';
import Button from '../../components/Button';
import ProfileHeaderButton from '../../components/ProfileHeaderButton';

const ReservationsScreen = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);

    useEffect(() => {
        loadReservations();
    }, []);

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

    const renderReservation = ({ item }) => {
        const isPending = item.status === 'pending';
        const isExpired = new Date(item.expires_at) <= new Date();

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.merchant}>{item.business_name}</Text>
                    </View>
                    {isPending && !isExpired && (
                        <CountdownTimer expiresAt={item.expires_at} />
                    )}
                </View>

                <View style={styles.statusContainer}>
                    <View
                        style={[
                            styles.statusBadge,
                            item.status === 'collected' && styles.statusCollected,
                            item.status === 'pending' && styles.statusPending,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                item.status === 'collected' && styles.statusTextCollected,
                                item.status === 'pending' && styles.statusTextPending,
                            ]}
                        >
                            {item.status === 'collected' ? '✓ Récupéré' : '⏳ En attente'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.price}>€{item.discounted_price.toFixed(2)}</Text>
                    <Text style={styles.address}>{item.address}</Text>
                </View>

                {isPending && !isExpired && (
                    <Button
                        title="Afficher le QR Code"
                        onPress={() => setSelectedQR(item.qr_code)}
                        variant="primary"
                        style={styles.qrButton}
                    />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Mes Réservations</Text>
                    <ProfileHeaderButton />
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
                                Vos réservations apparaîtront ici
                            </Text>
                        </View>
                    )
                }
            />

            <Modal
                visible={!!selectedQR}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedQR(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedQR(null)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Votre QR Code</Text>
                        <Text style={styles.modalSubtitle}>
                            Présentez ce code au commerçant
                        </Text>

                        <View style={styles.qrContainer}>
                            {selectedQR && <QRCode value={selectedQR} size={250} />}
                        </View>

                        <Button
                            title="Fermer"
                            onPress={() => setSelectedQR(null)}
                            variant="secondary"
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 60,
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
    cardHeader: {
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
    merchant: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusContainer: {
        marginBottom: 12,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusPending: {
        backgroundColor: '#fef3c7',
    },
    statusCollected: {
        backgroundColor: '#dcfce7',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusTextPending: {
        color: '#92400e',
    },
    statusTextCollected: {
        color: '#16a34a',
    },
    infoContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
        marginBottom: 12,
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        color: '#22c55e',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#6b7280',
    },
    qrButton: {
        marginTop: 8,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    qrContainer: {
        alignItems: 'center',
        padding: 20,
        marginBottom: 24,
    },
});

export default ReservationsScreen;
