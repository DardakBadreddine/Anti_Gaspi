import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createReview } from '../../api/reviews';
import RatingStars from '../../components/RatingStars';
import Button from '../../components/Button';

const ReviewScreen = ({ route, navigation }) => {
    const { merchantId, merchantName, reservationId, basketTitle } = route.params || {};
    const insets = useSafeAreaInsets();
    const [merchantRating, setMerchantRating] = useState(5);
    const [basketRating, setBasketRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!merchantId) {
            Alert.alert('Erreur', 'ID commerçant manquant. Impossible de créer l\'avis.');
            return;
        }

        // Convert merchantId to integer
        const merchantIdInt = parseInt(merchantId, 10);
        if (isNaN(merchantIdInt)) {
            Alert.alert('Erreur', 'ID commerçant invalide.');
            return;
        }

        if (merchantRating < 1 || merchantRating > 5) {
            Alert.alert('Erreur', 'Veuillez noter le commerçant');
            return;
        }

        if (basketRating < 1 || basketRating > 5) {
            Alert.alert('Erreur', 'Veuillez noter le panier');
            return;
        }

        setLoading(true);
        try {
            // Convert reservationId to integer if provided
            const reservationIdInt = reservationId ? parseInt(reservationId, 10) : null;
            await createReview(merchantIdInt, merchantRating, basketRating, comment, reservationIdInt);
            Alert.alert('Succès', 'Votre avis a été enregistré', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            console.error('Error creating review:', error);
            const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                                error.response?.data?.error || 
                                'Impossible d\'enregistrer l\'avis';
            Alert.alert('Erreur', errorMessage);
        }
        setLoading(false);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Laisser un avis</Text>
                <Text style={styles.subtitle}>{merchantName || 'Commerçant'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Merchant Rating Section */}
                <View style={styles.ratingSection}>
                    <Text style={styles.label}>Notez le commerçant</Text>
                    <Text style={styles.subLabel}>{merchantName || 'Commerçant'}</Text>
                    <View style={styles.ratingContainer}>
                        <RatingStars
                            rating={merchantRating}
                            onRatingChange={setMerchantRating}
                            size={40}
                            editable={true}
                        />
                    </View>
                </View>

                {/* Basket Rating Section */}
                <View style={styles.ratingSection}>
                    <Text style={styles.label}>Notez le panier</Text>
                    <Text style={styles.subLabel}>{basketTitle || 'Panier'}</Text>
                    <View style={styles.ratingContainer}>
                        <RatingStars
                            rating={basketRating}
                            onRatingChange={setBasketRating}
                            size={40}
                            editable={true}
                        />
                    </View>
                </View>

                <View style={styles.commentSection}>
                    <Text style={styles.label}>Votre commentaire (optionnel)</Text>
                    <TextInput
                        style={styles.commentInput}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Partagez votre expérience..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                <Button
                    title="Publier l'avis"
                    onPress={handleSubmit}
                    loading={loading}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    subLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 8,
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    ratingSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    ratingContainer: {
        marginVertical: 8,
    },
    commentSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
        minHeight: 120,
        backgroundColor: '#f9fafb',
    },
});

export default ReviewScreen;
