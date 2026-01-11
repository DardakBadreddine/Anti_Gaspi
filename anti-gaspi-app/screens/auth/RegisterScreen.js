import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LocationPicker from '../../components/LocationPicker';
import { getCurrentLocation, getAddressFromCoordinates } from '../../utils/location';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const insets = useSafeAreaInsets();
    const [role, setRole] = useState('customer'); // 'customer' or 'merchant'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [location, setLocation] = useState(null);
    
    // Image states for merchants
    const [coverImageBase64, setCoverImageBase64] = useState(null);
    const [logoImageBase64, setLogoImageBase64] = useState(null);
    
    // Profile image for customers
    const [profileImageBase64, setProfileImageBase64] = useState(null);

    const handleGetLocation = async () => {
        setLocationLoading(true);
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
            const formattedAddress = await getAddressFromCoordinates(loc.latitude, loc.longitude);
            if (formattedAddress) setAddress(formattedAddress);
            Alert.alert('Succès', 'Position récupérée avec succès');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de récupérer votre position');
        }
        setLocationLoading(false);
    };

    const pickCoverImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setCoverImageBase64(base64);
        }
    };

    const pickLogoImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setLogoImageBase64(base64);
        }
    };

    const pickProfileImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setProfileImageBase64(base64);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (role === 'merchant' && (!address || !location)) {
            Alert.alert('Erreur', 'Les commerçants doivent fournir une adresse et une position');
            return;
        }

        const userData = {
            name,
            email,
            password,
            role,
        };

        if (role === 'merchant') {
            userData.businessName = businessName || name;
            userData.address = address;
            userData.latitude = location.latitude;
            userData.longitude = location.longitude;
            userData.phone = phone;
            userData.description = description;
            if (coverImageBase64) {
                userData.coverImageBase64 = coverImageBase64;
            }
            if (logoImageBase64) {
                userData.logoImageBase64 = logoImageBase64;
            }
        } else {
            // For customers
            if (profileImageBase64) {
                userData.profileImageBase64 = profileImageBase64;
            }
            if (phone) {
                userData.phone = phone;
            }
            if (location) {
                userData.latitude = location.latitude;
                userData.longitude = location.longitude;
            }
            if (address) {
                userData.address = address;
            }
        }

        setLoading(true);
        const result = await register(userData);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Erreur', result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>Créer un compte</Text>

                <View style={styles.roleSelector}>
                    <TouchableOpacity
                        style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
                        onPress={() => setRole('customer')}
                    >
                        <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
                            🛒 Client
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.roleButton, role === 'merchant' && styles.roleButtonActive]}
                        onPress={() => setRole('merchant')}
                    >
                        <Text style={[styles.roleText, role === 'merchant' && styles.roleTextActive]}>
                            🏪 Commerçant
                        </Text>
                    </TouchableOpacity>
                </View>

                <Input
                    label="Nom complet *"
                    value={name}
                    onChangeText={setName}
                    placeholder="Jean Dupont"
                    style={styles.input}
                />

                <Input
                    label="Email *"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    style={styles.input}
                />

                <Input
                    label="Mot de passe *"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    style={styles.input}
                />

                {role === 'customer' && (
                    <>
                        {/* Profile Image */}
                        <Text style={styles.sectionLabel}>Photo de profil (optionnel)</Text>
                        <TouchableOpacity onPress={pickProfileImage} style={styles.imagePicker}>
                            {profileImageBase64 ? (
                                <Image source={{ uri: profileImageBase64 }} style={styles.profileImagePreview} />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="camera-outline" size={32} color="#8E8E93" />
                                    <Text style={styles.imagePlaceholderText}>Ajouter une photo de profil</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Input
                            label="Téléphone (optionnel)"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+33 6 12 34 56 78"
                            keyboardType="phone-pad"
                            style={styles.input}
                        />

                        <Text style={styles.sectionLabel}>Adresse (optionnel)</Text>
                        <LocationPicker
                            onLocationSelect={async (loc) => {
                                setLocation(loc);
                                if (loc) {
                                    const formattedAddress = await getAddressFromCoordinates(loc.latitude, loc.longitude);
                                    if (formattedAddress) setAddress(formattedAddress);
                                }
                            }}
                            initialLocation={null}
                        />
                        {address && (
                            <Text style={styles.addressText}>{address}</Text>
                        )}
                    </>
                )}

                {role === 'merchant' && (
                    <>
                        <Input
                            label="Nom du commerce"
                            value={businessName}
                            onChangeText={setBusinessName}
                            placeholder="Ma Boulangerie"
                            style={styles.input}
                        />

                        <Input
                            label="Adresse *"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="123 Rue de la Paix, Paris"
                            style={styles.input}
                        />

                        <Text style={styles.sectionLabel}>Position du commerce *</Text>
                        <LocationPicker
                            onLocationSelect={async (loc) => {
                                setLocation(loc);
                                if (loc) {
                                    const formattedAddress = await getAddressFromCoordinates(loc.latitude, loc.longitude);
                                    if (formattedAddress) setAddress(formattedAddress);
                                }
                            }}
                            initialLocation={null}
                        />
                        {address && (
                            <Text style={styles.addressText}>{address}</Text>
                        )}

                        {/* Cover Image */}
                        <Text style={styles.sectionLabel}>Image de couverture (optionnel)</Text>
                        <TouchableOpacity onPress={pickCoverImage} style={styles.imagePicker}>
                            {coverImageBase64 ? (
                                <Image source={{ uri: coverImageBase64 }} style={styles.coverImagePreview} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="image-outline" size={32} color="#8E8E93" />
                                    <Text style={styles.imagePlaceholderText}>Ajouter une image de couverture</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Logo Image */}
                        <Text style={styles.sectionLabel}>Logo (optionnel)</Text>
                        <TouchableOpacity onPress={pickLogoImage} style={styles.logoPicker}>
                            {logoImageBase64 ? (
                                <Image source={{ uri: logoImageBase64 }} style={styles.logoPreview} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Ionicons name="camera-outline" size={24} color="#8E8E93" />
                                    <Text style={styles.imagePlaceholderText}>Ajouter un logo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Input
                            label="Téléphone"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+33 6 12 34 56 78"
                            keyboardType="phone-pad"
                            style={styles.input}
                        />

                        <Input
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Boulangerie artisanale..."
                            multiline
                            style={styles.input}
                        />
                    </>
                )}

                <Button
                    title="S'inscrire"
                    onPress={handleRegister}
                    loading={loading}
                    style={styles.registerButton}
                />

                <Button
                    title="Retour à la connexion"
                    onPress={() => navigation.goBack()}
                    variant="secondary"
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#000',
        marginBottom: 32,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    roleSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    roleButtonActive: {
        backgroundColor: '#f0fdf4',
        borderColor: '#22c55e',
        borderWidth: 2.5,
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },
    roleTextActive: {
        color: '#16a34a',
        fontWeight: '700',
    },
    input: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
        marginTop: 8,
    },
    locationButton: {
        marginBottom: 20,
    },
    registerButton: {
        marginTop: 8,
        marginBottom: 16,
    },
    imagePicker: {
        marginBottom: 24,
    },
    coverImagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
    },
    imagePlaceholder: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    logoPicker: {
        marginBottom: 24,
        alignItems: 'center',
    },
    logoPreview: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F2F2F7',
        borderWidth: 4,
        borderColor: '#fff',
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    profileImagePreview: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F2F2F7',
        alignSelf: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    profileImagePlaceholder: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        alignSelf: 'center',
    },
    imagePlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
    },
    addressText: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
});

export default RegisterScreen;
