import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

const CATEGORIES = [
    'Tous',
    'Boulangerie',
    'Restaurant',
    'Supermarché',
    'Épicerie',
    'Traiteur',
    'Pâtisserie',
    'Autre',
];

const SORT_OPTIONS = [
    { value: 'distance', label: 'Distance' },
    { value: 'price', label: 'Prix croissant' },
    { value: 'rating', label: 'Meilleure note' },
];

const FilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
    const insets = useSafeAreaInsets();
    const [category, setCategory] = useState(initialFilters.category || 'Tous');
    const [minPrice, setMinPrice] = useState(initialFilters.minPrice || 0);
    const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || 20);
    const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'distance');

    const handleApply = () => {
        const filters = {
            category: category !== 'Tous' ? category : null,
            minPrice: minPrice > 0 ? minPrice : null,
            maxPrice: maxPrice < 20 ? maxPrice : null,
            sortBy,
        };
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setCategory('Tous');
        setMinPrice(0);
        setMaxPrice(20);
        setSortBy('distance');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Filtres</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Category Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Catégorie</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            category === cat && styles.categoryChipActive,
                                        ]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                category === cat && styles.categoryTextActive,
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Prix: {minPrice.toFixed(2)} € - {maxPrice.toFixed(2)} €
                            </Text>
                            <View style={styles.sliderContainer}>
                                <Text style={styles.sliderLabel}>Min</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={20}
                                    step={0.5}
                                    value={minPrice}
                                    onValueChange={setMinPrice}
                                    minimumTrackTintColor="#22c55e"
                                    maximumTrackTintColor="#d1d5db"
                                />
                                <Text style={styles.sliderValue}>{minPrice.toFixed(2)} €</Text>
                            </View>
                            <View style={styles.sliderContainer}>
                                <Text style={styles.sliderLabel}>Max</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={20}
                                    step={0.5}
                                    value={maxPrice}
                                    onValueChange={setMaxPrice}
                                    minimumTrackTintColor="#22c55e"
                                    maximumTrackTintColor="#d1d5db"
                                />
                                <Text style={styles.sliderValue}>{maxPrice.toFixed(2)} €</Text>
                            </View>
                        </View>

                        {/* Sort Options */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Trier par</Text>
                            {SORT_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={styles.sortOption}
                                    onPress={() => setSortBy(option.value)}
                                >
                                    <Text style={styles.sortOptionText}>{option.label}</Text>
                                    {sortBy === option.value && (
                                        <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={handleReset}
                        >
                            <Text style={styles.resetText}>Réinitialiser</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyText}>Appliquer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
    },
    closeButton: {
        padding: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    categoryChipActive: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    categoryTextActive: {
        color: '#16a34a',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sliderLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
        width: 40,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    sliderValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        width: 60,
        textAlign: 'right',
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#1f2937',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
    },
    resetText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    applyButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#22c55e',
        alignItems: 'center',
    },
    applyText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});

export default FilterModal;
