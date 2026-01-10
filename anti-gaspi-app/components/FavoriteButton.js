import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addFavorite, removeFavorite, checkFavorite } from '../api/favorites';

const FavoriteButton = ({ merchantId, size = 28, onToggle }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFavoriteStatus();
    }, [merchantId]);

    const loadFavoriteStatus = async () => {
        try {
            const result = await checkFavorite(merchantId);
            setIsFavorite(result.isFavorite);
        } catch (error) {
            console.error('Check favorite error:', error);
        }
    };

    const handleToggle = async () => {
        setLoading(true);
        try {
            if (isFavorite) {
                await removeFavorite(merchantId);
                setIsFavorite(false);
            } else {
                await addFavorite(merchantId);
                setIsFavorite(true);
            }
            onToggle && onToggle(!isFavorite);
        } catch (error) {
            console.error('Toggle favorite error:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <TouchableOpacity style={styles.button} disabled>
                <ActivityIndicator size="small" color="#22c55e" />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.button, isFavorite && styles.favoriteButton]}
            onPress={handleToggle}
            activeOpacity={0.7}
        >
            <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={size}
                color={isFavorite ? '#ef4444' : '#6b7280'}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    favoriteButton: {
        backgroundColor: '#fee2e2',
    },
});

export default FavoriteButton;
