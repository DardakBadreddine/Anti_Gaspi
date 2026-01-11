import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RatingStars = ({ rating, onRatingChange, size = 20, editable = false, showValue = false }) => {
    const handlePress = (value) => {
        if (editable && onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <TouchableOpacity
                        key={value}
                        onPress={() => handlePress(value)}
                        disabled={!editable}
                        activeOpacity={editable ? 0.7 : 1}
                    >
                        <Ionicons
                            name={value <= rating ? 'star' : 'star-outline'}
                            size={size}
                            color={value <= rating ? '#fbbf24' : '#d1d5db'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            {showValue && (
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
    },
});

export default RatingStars;
