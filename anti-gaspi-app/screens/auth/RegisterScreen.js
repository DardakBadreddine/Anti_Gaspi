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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LocationPicker from '../../components/LocationPicker';
import { getCurrentLocation, getAddressFromCoordinates } from '../../utils/location';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
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

    const handleGetLocation = async () => {
        setLocationLoading(true);
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
            Alert.alert('Succès', 'Position récupérée avec succès');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de récupérer votre position');
        }
        setLocationLoading(false);
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
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
                />

                <Input
                    label="Email *"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                />

                <Input
                    label="Mot de passe *"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                />

                {role === 'merchant' && (
                    <>
                        <Input
                            label="Nom du commerce"
                            value={businessName}
                            onChangeText={setBusinessName}
                            placeholder="Ma Boulangerie"
                        />

                        <Input
                            label="Adresse *"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="123 Rue de la Paix, Paris"
                        />

                        <Input
                            label="Adresse *"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="123 Rue de la Paix, Paris"
                        />

                        <Text style={styles.label}>Position du commerce *</Text>
                        <LocationPicker
                            onLocationSelect={setLocation}
                            initialLocation={null}
                        />

                        <Input
                            label="Téléphone"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+33 6 12 34 56 78"
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Boulangerie artisanale..."
                            multiline
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
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    roleSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    roleTextActive: {
        color: '#16a34a',
    },
    locationButton: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 8,
    },
    registerButton: {
        marginBottom: 12,
    },
});

export default RegisterScreen;
