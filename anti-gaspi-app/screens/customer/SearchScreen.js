import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { searchBaskets } from '../../api/baskets';
import { getCurrentLocation } from '../../utils/location';
import BasketCard from '../../components/BasketCard';
import Button from '../../components/Button';
import ProfileHeaderButton from '../../components/ProfileHeaderButton';
import FilterModal from '../../components/FilterModal';

const RADIUS_OPTIONS = [2, 5, 10, 20, 30, 50, 100];

const SearchScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [radius, setRadius] = useState(10); // Default 10km
    const [location, setLocation] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        loadBaskets();
    }, [radius]);

    const loadBaskets = async () => {
        setLoading(true);
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);

            const result = await searchBaskets(loc.latitude, loc.longitude, radius, filters);
            setBaskets(result.baskets || []);
        } catch (error) {
            // Only show alert if it's not a background refresh
            if (!refreshing && loading) {
                console.error(error);
            }
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBaskets();
        setRefreshing(false);
    };

    const renderRadiusButton = (value) => (
        <TouchableOpacity
            key={value}
            style={[styles.radiusButton, radius === value && styles.radiusButtonActive]}
            onPress={() => setRadius(value)}
            activeOpacity={0.7}
        >
            <Text style={[styles.radiusText, radius === value && styles.radiusTextActive]}>
                {value} km
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>Découvrir</Text>
                        <Text style={styles.subtitle}>Sauvez des paniers autour de vous</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowFilters(true)}
                        >
                            <Ionicons name="options-outline" size={24} color="#000" />
                            {(filters.category || filters.minPrice || filters.maxPrice || filters.sortBy !== 'distance') && (
                                <View style={styles.filterBadge} />
                            )}
                        </TouchableOpacity>
                        <ProfileHeaderButton />
                    </View>
                </View>

                <View style={styles.radiusContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.radiusScroll}
                    >
                        {RADIUS_OPTIONS.map(renderRadiusButton)}
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={baskets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <BasketCard
                        basket={item}
                        onPress={() => navigation.navigate('BasketDetails', { basketId: item.id })}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: 100 + insets.bottom }
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#22c55e"
                    />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🌍</Text>
                            <Text style={styles.emptyTitle}>Rien à {radius} km</Text>
                            <Text style={styles.emptySubtitle}>
                                Essayez d'élargir votre recherche ou revenez plus tard.
                            </Text>
                            <Button
                                title="Actualiser"
                                onPress={loadBaskets}
                                variant="secondary"
                                style={styles.refreshButton}
                            />
                        </View>
                    )
                }
            />

            <FilterModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    loadBaskets();
                }}
                initialFilters={filters}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7', // Apple system gray 6
    },
    header: {
        backgroundColor: '#fff',
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f2f2f7',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#8E8E93', // Apple system gray
        fontWeight: '500',
        marginTop: 4,
    },
    radiusContainer: {
        marginHorizontal: -20, // To allow scroll to edges
    },
    radiusScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    radiusButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    radiusButtonActive: {
        backgroundColor: '#000', // Apple style: Black selected state
        borderColor: '#000',
    },
    radiusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    radiusTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 20,
        paddingTop: 24,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
        lineHeight: 22,
    },
    refreshButton: {
        minWidth: 140,
    },
});

export default SearchScreen;
