import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StarRating = ({ rating, size = 16, color = '#fbbf24', showCount = false, count = 0, onPress = null }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Render stars
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(
                <Ionicons
                    key={i}
                    name="star"
                    size={size}
                    color={color}
                    onPress={onPress ? () => onPress(i + 1) : undefined}
                    style={onPress && styles.clickable}
                />
            );
        } else if (i === fullStars && hasHalfStar) {
            stars.push(
                <Ionicons
                    key={i}
                    name="star-half"
                    size={size}
                    color={color}
                    onPress={onPress ? () => onPress(i + 1) : undefined}
                    style={onPress && styles.clickable}
                />
            );
        } else {
            stars.push(
                <Ionicons
                    key={i}
                    name="star-outline"
                    size={size}
                    color={color}
                    onPress={onPress ? () => onPress(i + 1) : undefined}
                    style={onPress && styles.clickable}
                />
            );
        }
    }

    return (
        <View style={styles.container}>
            {stars}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    clickable: {
        marginHorizontal: 2,
    }
});

export default StarRating;
