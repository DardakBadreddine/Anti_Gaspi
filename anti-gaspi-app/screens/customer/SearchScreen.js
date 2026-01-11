import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { searchBaskets } from '../../api/baskets';
import { addFavorite, removeFavorite } from '../../api/favorites';
import { getCategories } from '../../api/categories';
import { getCurrentLocation } from '../../utils/location';
import ShopCard from '../../components/ShopCard';
import Button from '../../components/Button';

const RADIUS_OPTIONS = [2, 5, 10, 20, 30, 50, 100];

const SearchScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [shops, setShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [radius, setRadius] = useState(10);
    const [location, setLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useFocusEffect(
        useCallback(() => {
            loadCategories();
            loadShops();
        }, [radius])
    );

    useEffect(() => {
        // Filter shops when search query or categories change
        let filtered = shops;

        // Filter by search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(shop =>
                shop.business_name.toLowerCase().includes(query) ||
                shop.address?.toLowerCase().includes(query) ||
                shop.tagline?.toLowerCase().includes(query)
            );
        }

        // Filter by selected categories
        if (selectedCategories.length > 0) {
            console.log('🔍 Filtering by categories:', {
                selectedCategories,
                shopsBeforeFilter: filtered.length
            });
            
            filtered = filtered.filter(shop => {
                // Check if shop has any paniers
                if (!shop.paniers || shop.paniers.length === 0) {
                    return false;
                }
                
                // Check if any of the shop's baskets has at least one selected category
                const hasMatchingCategory = shop.paniers.some(basket => {
                    const basketCategories = basket.categories || [];
                    const basketCategoryIds = basketCategories.map(c => Number(c.id));
                    const selectedIds = selectedCategories.map(id => Number(id));
                    
                    const matches = selectedIds.some(selectedId => basketCategoryIds.includes(selectedId));
                    
                    if (matches) {
                        console.log('✅ Basket matches:', {
                            shop: shop.business_name,
                            basketId: basket.id,
                            basketTitle: basket.title,
                            basketCategories: basketCategoryIds,
                            selectedIds
                        });
                    }
                    
                    return matches;
                });
                
                if (!hasMatchingCategory) {
                    console.log('❌ Shop filtered out:', shop.business_name, {
                        paniersCount: shop.paniers?.length,
                        allBasketCategories: shop.paniers?.map(b => ({
                            basketId: b.id,
                            categories: (b.categories || []).map(c => ({ id: c.id, name: c.name }))
                        }))
                    });
                }
                
                return hasMatchingCategory;
            });
            
            console.log('🔍 Shops after category filter:', filtered.length);
        }

        setFilteredShops(filtered);
    }, [searchQuery, shops, selectedCategories]);

    const loadCategories = async () => {
        try {
            const result = await getCategories();
            setCategories(result.categories || result || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadShops = async () => {
        setLoading(true);
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);

            const result = await searchBaskets(loc.latitude, loc.longitude, radius);
            const loadedShops = result.shops || [];
            setShops(loadedShops);
            setFilteredShops(loadedShops); // Initialize filtered shops
        } catch (error) {
            if (!refreshing && loading) {
                console.error(error);
            }
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadShops();
        setRefreshing(false);
    };

    const handleFavoriteToggle = async (merchantId) => {
        try {
            const shop = shops.find(s => s.id === merchantId);

            if (shop.is_favorited) {
                await removeFavorite(merchantId);
            } else {
                await addFavorite(merchantId);
            }

            setShops(shops.map(s =>
                s.id === merchantId
                    ? { ...s, is_favorited: !s.is_favorited }
                    : s
            ));
        } catch (error) {
            console.error('Error toggling favorite:', error);
            Alert.alert('Erreur', 'Impossible de modifier les favoris');
        }
    };

    const handleShopPress = (shop) => {
        navigation.navigate('ShopDetail', { shopId: shop.id, shop });
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => {
            const newSelection = prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId];
            
            console.log('🔍 Category filter changed:', {
                categoryId,
                newSelection,
                totalShops: shops.length
            });
            
            return newSelection;
        });
    };

    const clearCategories = () => {
        setSelectedCategories([]);
    };

    const renderRadiusButton = (km) => {
        const isSelected = radius === km;
        return (
            <TouchableOpacity
                key={km}
                style={[styles.radiusButton, isSelected && styles.radiusButtonActive]}
                onPress={() => setRadius(km)}
            >
                <Text style={[styles.radiusText, isSelected && styles.radiusTextActive]}>
                    {km} km
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.title}>Anti-Gaspi</Text>
                <Text style={styles.subtitle}>Trouvez des paniers à proximité</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un commerce..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#8E8E93"
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Categories Filter */}
                {categories.length > 0 && (
                    <View style={styles.categoriesContainer}>
                        <View style={styles.categoriesHeader}>
                            <Text style={styles.categoriesTitle}>Catégories</Text>
                            {selectedCategories.length > 0 && (
                                <TouchableOpacity onPress={clearCategories} style={styles.clearCategoriesButton}>
                                    <Text style={styles.clearCategoriesText}>Effacer</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesScroll}
                        >
                            {categories.map(category => {
                                const isSelected = selectedCategories.includes(category.id);
                                return (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.categoryPill,
                                            isSelected && styles.categoryPillActive,
                                            { borderColor: category.color || '#22c55e' }
                                        ]}
                                        onPress={() => toggleCategory(category.id)}
                                    >
                                        <Text style={styles.categoryIcon}>{category.icon || '🏷️'}</Text>
                                        <Text style={[
                                            styles.categoryText,
                                            isSelected && styles.categoryTextActive
                                        ]}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

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
                data={filteredShops}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ShopCard
                        shop={item}
                        onPress={handleShopPress}
                        onFavoriteToggle={handleFavoriteToggle}
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
                            <Text style={styles.emptyTitle}>Aucun panier disponible</Text>
                            <Text style={styles.emptySubtitle}>
                                Augmentez le rayon de recherche ou réessayez plus tard.
                            </Text>
                            <Button
                                title="Act ualiser"
                                onPress={onRefresh}
                                style={styles.refreshButton}
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
        backgroundColor: '#F2F2F7',
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
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
        marginTop: 4,
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        padding: 0,
    },
    clearButton: {
        padding: 4,
    },
    categoriesContainer: {
        marginTop: 8,
        marginBottom: 12,
    },
    categoriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoriesTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    clearCategoriesButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    clearCategoriesText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
    },
    categoriesScroll: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1.5,
        gap: 6,
    },
    categoryPillActive: {
        backgroundColor: '#f0fdf4',
    },
    categoryIcon: {
        fontSize: 16,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    categoryTextActive: {
        color: '#000',
    },
    radiusContainer: {
        marginTop: 0,
    },
    radiusScroll: {
        flexDirection: 'row',
        gap: 8,
    },
    radiusButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    radiusButtonActive: {
        backgroundColor: '#000',
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
        paddingHorizontal: 40,
        marginBottom: 16,
    },
    refreshButton: {
        paddingHorizontal: 32,
    },
});

export default SearchScreen;
