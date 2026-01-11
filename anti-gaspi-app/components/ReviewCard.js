import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RatingStars from './RatingStars';

const ReviewCard = ({ review }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {review.user_name?.substring(0, 1).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{review.user_name || 'Utilisateur'}</Text>
                        <Text style={styles.date}>
                            {new Date(review.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>
                <RatingStars rating={review.rating} size={16} />
            </View>
            {review.comment && (
                <Text style={styles.comment}>{review.comment}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    comment: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginTop: 8,
    },
});

export default ReviewCard;
