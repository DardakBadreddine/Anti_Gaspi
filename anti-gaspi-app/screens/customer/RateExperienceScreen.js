import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { submitReview } from '../../api/reviews';
import StarRating from '../../components/StarRating';

const RateExperienceScreen = ({ route, navigation }) => {
    const { reservationId, merchantName } = route.params;
    const insets = useSafeAreaInsets();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Erreur', 'Veuillez sélectionner une note');
            return;
        }

        setLoading(true);
        try {
            await submitReview(reservationId, rating, comment.trim() || null);
            Alert.alert(
                'Merci !',
                'Votre avis a été publié avec succès',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Erreur', error.response?.data?.error || 'Impossible de publier l\'avis');
        }
        setLoading(false);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Ionicons name="star" size={48} color="#fbbf24" />
                    <Text style={styles.title}>Notez votre expérience</Text>
                    <Text style={styles.subtitle}>{merchantName}</Text>
                </View>

                <View style={styles.ratingContainer}>
                    <Text style={styles.label}>Votre note</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={48}
                                    color="#fbbf24"
                                    style={styles.star}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.ratingLabel}>
                        {rating === 5 && 'Excellent !'}
                        {rating === 4 && 'Très bien'}
                        {rating === 3 && 'Bien'}
                        {rating === 2 && 'Moyen'}
                        {rating === 1 && 'Décevant'}
                    </Text>
                </View>

                <View style={styles.commentContainer}>
                    <Text style={styles.label}>Votre commentaire (optionnel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Partagez votre expérience..."
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Envoi...' : 'Publier mon avis'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    ratingContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    star: {
        marginHorizontal: 4,
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fbbf24',
    },
    commentContainer: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
        backgroundColor: '#f9fafb',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    submitButton: {
        backgroundColor: '#22c55e',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});

export default RateExperienceScreen;
