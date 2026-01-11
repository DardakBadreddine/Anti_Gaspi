import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { createBasket } from '../../api/baskets';
import Input from '../../components/Input';
import Button from '../../components/Button';

const AddBasketScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [duration, setDuration] = useState(1);
    const [autoRelist, setAutoRelist] = useState(false);
    const [loading, setLoading] = useState(false);

    const DURATION_OPTIONS = [
        { label: '30 min', value: 0.5 },
        { label: '1h', value: 1 },
        { label: '2h', value: 2 },
        { label: '3h', value: 3 },
        { label: '4h', value: 4 },
        { label: '6h', value: 6 },
        { label: '12h', value: 12 },
        { label: '24h', value: 24 },
    ];

    const handleSubmit = async () => {
        if (!title || !originalPrice || !discountedPrice || !quantity) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        const original = parseFloat(originalPrice);
        const discounted = parseFloat(discountedPrice);
        const qty = parseInt(quantity);

        if (isNaN(original) || isNaN(discounted) || isNaN(qty)) {
            Alert.alert('Erreur', 'Veuillez entrer des valeurs valides');
            return;
        }

        if (discounted >= original) {
            Alert.alert('Erreur', 'Le prix réduit doit être inférieur au prix original');
            return;
        }

        if (qty < 1) {
            Alert.alert('Erreur', 'La quantité doit être au moins 1');
            return;
        }

        setLoading(true);
        try {
            await createBasket({
                title,
                description,
                originalPrice: original,
                discountedPrice: discounted,
                quantity: qty,
                durationHours: duration,
                autoRelist,
            });

            Alert.alert('Succès', 'Panier créé avec succès', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset form
                        setTitle('');
                        setDescription('');
                        setOriginalPrice('');
                        setDiscountedPrice('');
                        setQuantity('1');
                        setDuration(1);
                        navigation.goBack();
                    },
                },
            ]);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de créer le panier');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Nouveau Panier</Text>
                <Text style={styles.subtitle}>
                    Créez un panier anti-gaspi
                </Text>

                <Input
                    label="Titre *"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Panier surprise boulangerie"
                />

                <Input
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Pain, viennoiseries, pâtisseries..."
                    multiline
                />

                <Input
                    label="Prix original (€) *"
                    value={originalPrice}
                    onChangeText={setOriginalPrice}
                    placeholder="15.00"
                    keyboardType="decimal-pad"
                />

                <Input
                    label="Prix réduit (€) *"
                    value={discountedPrice}
                    onChangeText={setDiscountedPrice}
                    placeholder="5.00"
                    keyboardType="decimal-pad"
                />

                <Input
                    label="Quantité *"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="1"
                    keyboardType="number-pad"
                />

                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Remettre en vente si expiré ?</Text>
                    <Switch
                        value={autoRelist}
                        onValueChange={setAutoRelist}
                        trackColor={{ false: "#E5E7EB", true: "#bbf7d0" }}
                        thumbColor={autoRelist ? "#22c55e" : "#f9fafb"}
                    />
                </View>

                {/* Duration Selector */}
                <View style={styles.durationContainer}>
                    <Text style={styles.durationLabel}>Durée de disponibilité *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.durationRow}>
                            {DURATION_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.durationButton,
                                        duration === option.value && styles.durationButtonActive
                                    ]}
                                    onPress={() => setDuration(option.value)}
                                >
                                    <Text style={[
                                        styles.durationButtonText,
                                        duration === option.value && styles.durationButtonTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.preview}>
                    <Text style={styles.previewLabel}>Aperçu de la réduction:</Text>
                    {originalPrice && discountedPrice && (
                        <Text style={styles.previewText}>
                            -{Math.round(((parseFloat(originalPrice) - parseFloat(discountedPrice)) / parseFloat(originalPrice)) * 100)}%
                        </Text>
                    )}
                </View>

                <Button
                    title="Créer le panier"
                    onPress={handleSubmit}
                    loading={loading}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 24,
    },
    durationContainer: {
        marginBottom: 24,
    },
    durationLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    durationRow: {
        flexDirection: 'row',
        gap: 8,
    },
    durationButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    durationButtonActive: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
    },
    durationButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    durationButtonTextActive: {
        color: '#16a34a',
    },
    preview: {
        backgroundColor: '#dcfce7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    previewLabel: {
        fontSize: 14,
        color: '#16a34a',
        marginBottom: 4,
    },
    previewText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#16a34a',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
});

export default AddBasketScreen;
