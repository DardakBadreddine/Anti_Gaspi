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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBasket } from '../../api/baskets';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ImagePicker from '../../components/ImagePicker';

const AddBasketScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState(['Autre']); // Array for multi-select
    const [loading, setLoading] = useState(false);

    const CATEGORIES = [
        'Boulangerie',
        'Restaurant',
        'Supermarché',
        'Épicerie',
        'Traiteur',
        'Pâtisserie',
        'Autre',
    ];

    const handleSubmit = async () => {
        if (!title || !originalPrice || !discountedPrice || !quantity || category.length === 0) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires et sélectionner au moins une catégorie');
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
                imageUrl: imageUrl || null,
                category,
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
                        setImageUrl('');
                        setCategory(['Autre']);
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
                    Créez un panier anti-gaspi (expire dans 1h)
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

                <View style={styles.categoryContainer}>
                    <Text style={styles.label}>Catégories*</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => {
                            const isSelected = category.includes(cat);
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        isSelected && styles.categoryChipSelected
                                    ]}
                                    onPress={() => {
                                        if (isSelected) {
                                            // Remove
                                            setCategory(category.filter(c => c !== cat));
                                        } else {
                                            // Add
                                            setCategory([...category, cat]);
                                        }
                                    }}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        isSelected && styles.categoryChipTextSelected
                                    ]}>
                                        {cat}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

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

                <ImagePicker
                    selectedImageUrl={imageUrl}
                    onSelectImage={setImageUrl}
                />

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
    categoryContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    categoryChipSelected: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    categoryChipTextSelected: {
        color: '#16a34a',
        fontWeight: '600',
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
});

export default AddBasketScreen;
