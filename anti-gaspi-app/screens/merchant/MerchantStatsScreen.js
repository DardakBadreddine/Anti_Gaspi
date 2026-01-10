import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatsCard from '../../components/StatsCard';
import { getMerchantStats } from '../../api/merchantStats';

const MerchantStatsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const result = await getMerchantStats();
            setStats(result.stats);
        } catch (error) {
            console.error('Load merchant stats error:', error);
            Alert.alert('Erreur', 'Impossible de charger les statistiques');
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
                <Text style={styles.title}>Mes Statistiques</Text>
                <Text style={styles.subtitle}>
                    Tableau de bord de votre activité
                </Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <Text style={styles.sectionTitle}>📊 Paniers</Text>
                <StatsCard
                    icon="basket-outline"
                    iconColor="#22c55e"
                    label="Paniers créés"
                    value={stats?.totalBaskets || 0}
                    unit=""
                />
                <StatsCard
                    icon="checkmark-circle-outline"
                    iconColor="#10b981"
                    label="Paniers vendus"
                    value={stats?.soldBaskets || 0}
                    unit=""
                />
                <StatsCard
                    icon="time-outline"
                    iconColor="#f59e0b"
                    label="Paniers disponibles"
                    value={stats?.activeBaskets || 0}
                    unit=""
                />

                <Text style={styles.sectionTitle}>💰 Revenus</Text>
                <StatsCard
                    icon="wallet-outline"
                    iconColor="#22c55e"
                    label="Revenus totaux"
                    value={stats?.totalRevenue || 0}
                    unit="€"
                />

                <Text style={styles.sectionTitle}>🌱 Impact Environnemental</Text>
                <StatsCard
                    icon="leaf-outline"
                    iconColor="#10b981"
                    label="Nourriture sauvée"
                    value={stats?.savedFromWaste || 0}
                    unit="kg"
                />

                <Text style={styles.sectionTitle}>👥 Clients & Avis</Text>
                <StatsCard
                    icon="people-outline"
                    iconColor="#3b82f6"
                    label="Clients uniques"
                    value={stats?.customers || 0}
                    unit=""
                />
                <StatsCard
                    icon="star-outline"
                    iconColor="#fbbf24"
                    label="Note moyenne"
                    value={stats?.averageRating || 0}
                    unit={`/5 (${stats?.reviewCount || 0} avis)`}
                />

                <View style={styles.badge}>
                    <Text style={styles.badgeTitle}>🌟 Commerçant Engagé</Text>
                    <Text style={styles.badgeText}>
                        Vous avez sauvé {stats?.savedFromWaste || 0}kg de nourriture !
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
        textAlign: 'center',
    },
});

export default MerchantStatsScreen;
