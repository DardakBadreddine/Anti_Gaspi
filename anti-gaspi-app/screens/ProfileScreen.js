import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { getCurrentLocation } from '../utils/location';

const ProfileScreen = ({ navigation }) => {
    const { user, update, deleteAccount } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState(''); // Only if changing
    const [address, setAddress] = useState(user?.address || '');
    const [businessName, setBusinessName] = useState(user?.business_name || '');
    const [description, setDescription] = useState(user?.description || '');
    const [phone, setPhone] = useState(user?.phone || '');

    // For merchant location update
    const [location, setLocation] = useState({
        latitude: user?.latitude,
        longitude: user?.longitude
    });
    const [locationLoading, setLocationLoading] = useState(false);

    const handleGetLocation = async () => {
        setLocationLoading(true);
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
            Alert.alert('Succès', 'Position mise à jour');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de récupérer votre position');
        }
        setLocationLoading(false);
    };

    const handleUpdate = async () => {
        setLoading(true);

        const updateData = {
            name,
            email,
        };

        if (password) updateData.password = password;
        if (address) updateData.address = address;

        if (user.role === 'merchant') {
            updateData.businessName = businessName;
            updateData.description = description;
            updateData.phone = phone;
            if (location) {
                updateData.latitude = location.latitude;
                updateData.longitude = location.longitude;
            }
        }

        const result = await update(updateData);
        setLoading(false);

        if (result.success) {
            Alert.alert('Succès', 'Profil mis à jour avec succès', [
                { text: 'OK', onPress: () => setPassword('') } // Clear password field
            ]);
        } else {
            Alert.alert('Erreur', result.error);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Supprimer le compte',
            'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et effacera toutes vos données.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        const result = await deleteAccount();
                        if (!result.success) {
                            setLoading(false);
                            Alert.alert('Erreur', result.error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Personnelles</Text>

                    <Input
                        label="Nom complet"
                        value={name}
                        onChangeText={setName}
                    />

                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />

                    <Input
                        label="Nouveau mot de passe (laisser vide pour conserver l'actuel)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        placeholder="••••••••"
                    />
                </View>

                {user.role === 'merchant' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informations Commerce</Text>

                        <Input
                            label="Nom du commerce"
                            value={businessName}
                            onChangeText={setBusinessName}
                        />

                        <Input
                            label="Adresse"
                            value={address}
                            onChangeText={setAddress}
                        />

                        <Button
                            title={location?.latitude ? '📍 Position enregistrée (Mettre à jour)' : '📍 Ajouter ma position'}
                            onPress={handleGetLocation}
                            loading={locationLoading}
                            variant="secondary"
                            style={styles.locationButton}
                        />

                        <Input
                            label="Téléphone"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}
                        />
                    </View>
                )}

                <View style={styles.footer}>
                    <Button
                        title="Sauvegarder les modifications"
                        onPress={handleUpdate}
                        loading={loading}
                        style={styles.saveButton}
                    />

                    <Button
                        title="Supprimer mon compte"
                        onPress={handleDelete}
                        variant="danger"
                        style={styles.deleteButton}
                    />
                </View>
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
    section: {
        marginBottom: 24,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    locationButton: {
        marginBottom: 16,
    },
    footer: {
        gap: 16,
        marginBottom: 32,
    },
    saveButton: {
        backgroundColor: '#22c55e',
    },
    deleteButton: {
        marginTop: 16,
    },
});

export default ProfileScreen;
