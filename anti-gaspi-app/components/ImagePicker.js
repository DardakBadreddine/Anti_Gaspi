import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FOOD_IMAGES = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
        label: 'Pain',
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&q=80',
        label: 'Légumes',
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
        label: 'Plats',
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
        label: 'Pâtisseries',
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
        label: 'Sandwichs',
    },
    {
        id: 6,
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        label: 'Salades',
    },
    {
        id: 7,
        url: 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800&q=80',
        label: 'Supermarché',
    },
    {
        id: 8,
        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
        label: 'Épicerie',
    },
];

const ImagePicker = ({ selectedImageUrl, onSelectImage }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Choisir une image</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FOOD_IMAGES.map((image) => {
                    const isSelected = selectedImageUrl === image.url;
                    return (
                        <TouchableOpacity
                            key={image.id}
                            style={[
                                styles.imageContainer,
                                isSelected && styles.selectedContainer
                            ]}
                            onPress={() => onSelectImage(image.url)}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{ uri: image.url }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            {isSelected && (
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                </View>
                            )}
                            <Text style={styles.imageLabel}>{image.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    scrollContent: {
        paddingRight: 24,
    },
    imageContainer: {
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    selectedContainer: {
        borderColor: '#10b981',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    imageLabel: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
    },
});

export default ImagePicker;
