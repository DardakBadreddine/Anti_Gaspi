import React, { useState, useEffect } from 'react';
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
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { createBasket } from '../../api/baskets';
import { getCategories } from '../../api/categories';
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
    const [imageUri, setImageUri] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

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

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
            const data = await getCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            // Don't block the form if categories fail to load
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Nous avons besoin de l\'accès à vos photos pour ajouter une image.');
            return;
        }

        // Launch image picker with base64 option
        // Lower quality (0.6) to reduce file size while maintaining acceptable quality
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6, // Reduced from 0.8 to reduce base64 size
            base64: true, // Get base64 directly
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            // Store base64 if available
            if (result.assets[0].base64) {
                setImageBase64(result.assets[0].base64);
            }
        }
    };

    const takePhoto = async () => {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Nous avons besoin de l\'accès à la caméra pour prendre une photo.');
            return;
        }

        // Launch camera with base64 option
        // Lower quality (0.6) to reduce file size while maintaining acceptable quality
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6, // Reduced from 0.8 to reduce base64 size
            base64: true, // Get base64 directly
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            // Store base64 if available
            if (result.assets[0].base64) {
                setImageBase64(result.assets[0].base64);
            }
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Ajouter une photo',
            'Choisissez une option',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Prendre une photo', onPress: takePhoto },
                { text: 'Choisir depuis la galerie', onPress: pickImage },
            ]
        );
    };

    const convertImageToBase64 = async (uri) => {
        try {
            // If we already have base64 from ImagePicker, use it
            if (imageBase64) {
                return imageBase64;
            }

            // Otherwise, try to read from file system
            // Handle different URI formats
            let fileUri = uri;
            if (uri.startsWith('file://')) {
                fileUri = uri;
            } else if (uri.startsWith('content://') || uri.startsWith('ph://')) {
                // For content:// or ph:// URIs, we need to copy to a temporary file first
                const filename = uri.split('/').pop() || 'image.jpg';
                const fileUriNew = `${FileSystem.cacheDirectory}${filename}`;
                await FileSystem.copyAsync({
                    from: uri,
                    to: fileUriNew,
                });
                fileUri = fileUriNew;
            }

            // Read as base64
            const base64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return base64;
        } catch (error) {
            console.error('Error converting image to base64:', error);
            console.error('URI:', uri);
            // If all else fails, try fetch approach
            try {
                const response = await fetch(uri);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result;
                        // Remove data:image/...;base64, prefix if present
                        const base64 = base64String.includes(',') 
                            ? base64String.split(',')[1] 
                            : base64String;
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (fetchError) {
                console.error('Fetch approach also failed:', fetchError);
                throw new Error('Impossible de convertir l\'image. Veuillez réessayer.');
            }
        }
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

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
            // Convert image to base64 if selected
            let imageBase64 = null;
            if (imageUri) {
                setUploadingImage(true);
                try {
                    imageBase64 = await convertImageToBase64(imageUri);
                } catch (imgError) {
                    console.error('Error converting image:', imgError);
                    Alert.alert('Erreur', 'Impossible de traiter l\'image. Le panier sera créé sans image.');
                } finally {
                    setUploadingImage(false);
                }
            }

            await createBasket({
                title,
                description,
                originalPrice: original,
                discountedPrice: discounted,
                quantity: qty,
                durationHours: duration,
                autoRelist,
                imageBase64: imageBase64, // Send base64 image
                categoryIds: selectedCategories,
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
                        setImageUri(null);
                        setImageBase64(null);
                        setSelectedCategories([]);
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

                {/* Image Picker */}
                <View style={styles.imageSection}>
                    <Text style={styles.label}>Photo du panier (optionnel)</Text>
                    {imageUri ? (
                        <View style={styles.imagePreview}>
                            <Image 
                                source={{ uri: imageUri }} 
                                style={styles.previewImage}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => {
                                    setImageUri(null);
                                    setImageBase64(null);
                                }}
                            >
                                <Ionicons name="close-circle" size={24} color="#ef4444" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.changeImageButton}
                                onPress={showImageOptions}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.changeImageText}>Changer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.imagePickerButton}
                            onPress={showImageOptions}
                        >
                            <Ionicons name="camera-outline" size={32} color="#22c55e" />
                            <Text style={styles.imagePickerText}>Ajouter une photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Categories Selector */}
                <View style={styles.categoriesSection}>
                    <Text style={styles.label}>Catégories (optionnel)</Text>
                    {categoriesLoading ? (
                        <View style={styles.categoriesLoading}>
                            <ActivityIndicator size="small" color="#22c55e" />
                            <Text style={styles.loadingText}>Chargement des catégories...</Text>
                        </View>
                    ) : categories.length > 0 ? (
                        <View style={styles.categoriesContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategories.includes(category.id) && styles.categoryChipSelected
                                    ]}
                                    onPress={() => toggleCategory(category.id)}
                                >
                                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategories.includes(category.id) && styles.categoryTextSelected
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.categoriesError}>
                            Les catégories ne sont pas disponibles pour le moment
                        </Text>
                    )}
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
                    title={uploadingImage ? "Traitement de l'image..." : "Créer le panier"}
                    onPress={handleSubmit}
                    loading={loading || uploadingImage}
                    disabled={uploadingImage}
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
    imageSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    imagePickerButton: {
        borderWidth: 2,
        borderColor: '#22c55e',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0fdf4',
    },
    imagePickerText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
    },
    imagePreview: {
        marginTop: 12,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        height: 200,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        padding: 4,
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    changeImageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    categoriesSection: {
        marginBottom: 24,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryChipSelected: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
    },
    categoryIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    categoryTextSelected: {
        color: '#16a34a',
    },
    categoriesLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#6b7280',
    },
    categoriesError: {
        fontSize: 14,
        color: '#9ca3af',
        fontStyle: 'italic',
        padding: 16,
        textAlign: 'center',
    },
});

export default AddBasketScreen;
