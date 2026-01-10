import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUserStats } from '../../api/stats';
import StatsCard from '../../components/StatsCard';

const StatsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const result = await getUserStats();
            setStats(result.stats);
        } catch (error) {
            console.error('Load stats error:', error);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadStats();
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
                <Text style={styles.title}>Mon Impact</Text>
                <Text style={styles.subtitle}>
                    Votre contribution à la lutte contre le gaspillage
                </Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <Text style={styles.sectionTitle}>💰 Économies</Text>
                <StatsCard
                    icon="wallet-outline"
                    iconColor="#22c55e"
                    label="Argent économisé"
                    value={stats?.moneySaved || 0}
                    unit="€"
                />
                <StatsCard
                    icon="pricetag-outline"
                    iconColor="#3b82f6"
                    label="Valeur totale sauvée"
                    value={stats?.totalOriginalValue || 0}
                    unit="€"
                />

                <Text style={styles.sectionTitle}>🌱 Impact Environnemental</Text>
                <StatsCard
                    icon="leaf-outline"
                    iconColor="#10b981"
                    label="Nourriture sauvée"
                    value={stats?.environmentalImpact.foodSavedKg || 0}
                    unit="kg"
                />
                <StatsCard
                    icon="cloud-outline"
                    iconColor="#3b82f6"
                    label="CO₂ évité"
                    value={stats?.environmentalImpact.co2SavedKg || 0}
                    unit="kg"
                />
                <StatsCard
                    icon="restaurant-outline"
                    iconColor="#f59e0b"
                    label="Repas équivalents"
                    value={stats?.environmentalImpact.mealsEquivalent || 0}
                    unit="repas"
                />

                <Text style={styles.sectionTitle}>📊 Activité</Text>
                <StatsCard
                    icon="checkmark-circle-outline"
                    iconColor="#10b981"
                    label="Paniers récupérés"
                    value={stats?.totalCollected || 0}
                    unit=""
                />
                <StatsCard
                    icon="time-outline"
                    iconColor="#f59e0b"
                    label="Réservations en cours"
                    value={stats?.pendingReservations || 0}
                    unit=""
                />
                <StatsCard
                    icon="heart-outline"
                    iconColor="#ef4444"
                    label="Commerçants favoris"
                    value={stats?.favoriteMerchants || 0}
                    unit=""
                />

                <View style={styles.badge}>
                    <Text style={styles.badgeTitle}>🌟 Sauveur de Planète</Text>
                    <Text style={styles.badgeText}>
                        Vous avez sauvé {stats?.totalCollected || 0} panier{stats?.totalCollected > 1 ? 's' : ''} !
                    </Text>
                </View>
            </ScrollView>
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    scrollContent: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 16,
        marginBottom: 12,
    },
    badge: {
        marginTop: 24,
        padding: 24,
        backgroundColor: 'linear-gradient(135deg, #22c55e, #10b981)',
        backgroundColor: '#dcfce7',
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#22c55e',
    },
    badgeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 16,
        color: '#16a34a',
        fontWeight: '600',
    },
});

export default StatsScreen;
