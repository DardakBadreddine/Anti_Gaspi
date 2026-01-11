import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMerchantReservations } from '../../api/reservations';

const MerchantReservationsScreen = () => {
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
            const result = await getMerchantReservations();
            setReservations(result.reservations || []);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger les réservations');
        }
        setLoading(false);
    };

    const renderReservation = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.customer}>👤 {item.customer_name}</Text>
                        <Text style={styles.email}>{item.customer_email}</Text>
                    </View>
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

                <View style={styles.footer}>
                    <Text style={styles.price}>€{item.discounted_price.toFixed(2)}</Text>
                    <Text style={styles.date}>
                        {new Date(item.reserved_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Réservations</Text>
                        <Text style={styles.headerSubtitle}>
                            {reservations.filter(r => r.status === 'pending').length} en attente
                        </Text>
                    </View>
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
                            <Text style={styles.emptyText}>📋</Text>
                            <Text style={styles.emptyTitle}>Aucune réservation</Text>
                            <Text style={styles.emptySubtitle}>
                                Les réservations apparaîtront ici
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
        backgroundColor: '#f9fafb',
    },
    headerContainer: {
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
        marginBottom: 4,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6b7280',
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
        marginBottom: 8,
    },
    customer: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 2,
    },
    email: {
        fontSize: 12,
        color: '#9ca3af',
    },
    statusBadge: {
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
        fontSize: 12,
        fontWeight: '600',
    },
    statusTextPending: {
        color: '#92400e',
    },
    statusTextCollected: {
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
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#22c55e',
    },
    date: {
        fontSize: 14,
        color: '#6b7280',
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
});

export default MerchantReservationsScreen;
