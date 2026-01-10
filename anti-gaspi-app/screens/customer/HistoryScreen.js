import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getReservationHistory } from '../../api/reservations';

const HistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const result = await getReservationHistory();
            setHistory(result.history);
        } catch (error) {
            console.error('Load history error:', error);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'collected':
                return { name: 'checkmark-circle', color: '#22c55e' };
            case 'pending':
                return { name: 'time', color: '#f59e0b' };
            case 'cancelled':
                return { name: 'close-circle', color: '#ef4444' };
            default:
                return { name: 'help-circle', color: '#6b7280' };
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'collected':
                return 'Récupéré';
            case 'pending':
                return 'En attente';
            case 'cancelled':
                return 'Annulé';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Historique</Text>
            </View>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadHistory} />
                }
                renderItem={({ item }) => {
                    const statusIcon = getStatusIcon(item.status);
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.basketTitle}>{item.title}</Text>
                                    <Text style={styles.merchantName}>{item.business_name}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: statusIcon.color + '20' }]}>
                                    <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
                                    <Text style={[styles.statusText, { color: statusIcon.color }]}>
                                        {getStatusLabel(item.status)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardDetails}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.price}>{item.discounted_price.toFixed(2)} €</Text>
                                    <Text style={styles.originalPrice}>{item.original_price.toFixed(2)} €</Text>
                                </View>
                                <Text style={styles.date}>
                                    {new Date(item.reserved_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>
                            </View>
                            {item.status === 'collected' && !item.has_review && (
                                <View style={styles.reviewPrompt}>
                                    <Text style={styles.reviewPromptText}>
                                        Donnez votre avis sur cette expérience
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>Aucun historique</Text>
                    </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    card: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    basketTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    merchantName: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#22c55e',
    },
    originalPrice: {
        fontSize: 14,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    date: {
        fontSize: 12,
        color: '#6b7280',
    },
    reviewPrompt: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#fef3c7',
        borderRadius: 8,
    },
    reviewPromptText: {
        fontSize: 14,
        color: '#92400e',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 64,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 16,
    },
});

export default HistoryScreen;
