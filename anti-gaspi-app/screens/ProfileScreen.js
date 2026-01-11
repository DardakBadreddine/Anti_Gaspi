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
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import LocationPicker from '../components/LocationPicker';
import { getAddressFromCoordinates } from '../utils/location';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, update, deleteAccount } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    // Delete account modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Form state - editable fields
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [location, setLocation] = useState({
        latitude: user?.latitude,
        longitude: user?.longitude
    });

    const handleSave = async () => {
        setLoading(true);

        const result = await update({
            name,
            email,
            phone,
            address,
            latitude: location?.latitude,
            longitude: location?.longitude,
        });

        setLoading(false);

        if (result.success) {
            Alert.alert('Succès', 'Profil mis à jour avec succès');
            setEditing(false);
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de mettre à jour le profil');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Voulez-vous vraiment vous déconnecter?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'SUPPRIMER') {
            Alert.alert('Erreur', 'Veuillez taper "SUPPRIMER" pour confirmer');
            return;
        }

        setLoading(true);
        const result = await deleteAccount();
        setLoading(false);
        setShowDeleteModal(false);
        setDeleteConfirmText('');

        if (!result.success) {
            Alert.alert('Erreur', result.error || 'Impossible de supprimer le compte');
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
                    {
                        paddingBottom: insets.bottom + 24,
                        paddingTop: insets.top + 20
                    }
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Ionicons
                            name={user?.role === 'merchant' ? 'storefront' : 'person'}
                            size={48}
                            color="#22c55e"
                        />
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {user?.role === 'merchant' ? 'Commerçant' : 'Client'}
                        </Text>
                    </View>
                </View>

                {/* Editable Profile Fields */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Informations</Text>
                        {!editing && (
                            <TouchableOpacity onPress={() => setEditing(true)}>
                                <Ionicons name="create-outline" size={24} color="#22c55e" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Input
                        label="Nom"
                        value={name}
                        onChangeText={setName}
                        editable={editing}
                    />

                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        editable={editing}
                    />

                    <Input
                        label="Téléphone"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        editable={editing}
                    />

                    <Input
                        label="Adresse"
                        value={address}
                        onChangeText={setAddress}
                        editable={editing}
                    />

                    {editing && user?.role === 'merchant' && (
                        <>
                            <Text style={styles.label}>Position du commerce</Text>
                            <LocationPicker
                                onLocationSelect={async (loc) => {
                                    setLocation(loc);
                                    if (loc) {
                                        const formattedAddress = await getAddressFromCoordinates(loc.latitude, loc.longitude);
                                        if (formattedAddress) setAddress(formattedAddress);
                                    }
                                }}
                                initialLocation={location}
                            />
                        </>
                    )}

                    {editing && (
                        <View style={styles.editButtons}>
                            <Button
                                title="Annuler"
                                variant="secondary"
                                onPress={() => {
                                    setName(user?.name || '');
                                    setEmail(user?.email || '');
                                    setPhone(user?.phone || '');
                                    setAddress(user?.address || '');
                                    setEditing(false);
                                }}
                                style={styles.cancelButton}
                            />
                            <Button
                                title="Enregistrer"
                                onPress={handleSave}
                                loading={loading}
                                style={styles.saveButton}
                            />
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compte</Text>

                    <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                        <View style={styles.actionButtonContent}>
                            <Ionicons name="log-out-outline" size={24} color="#000" />
                            <Text style={styles.actionButtonText}>Déconnexion</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.dangerButton]}
                        onPress={() => setShowDeleteModal(true)}
                    >
                        <View style={styles.actionButtonContent}>
                            <Ionicons name="trash-outline" size={24} color="#ef4444" />
                            <Text style={[styles.actionButtonText, styles.dangerText]}>
                                Supprimer mon compte
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Delete Account Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="warning" size={48} color="#ef4444" />
                            <Text style={styles.modalTitle}>Supprimer le compte</Text>
                        </View>

                        <Text style={styles.modalText}>
                            Cette action est <Text style={styles.boldText}>irréversible</Text>.
                            Toutes vos données seront définitivement supprimées.
                        </Text>

                        <Text style={styles.modalText}>
                            Tapez <Text style={styles.boldText}>SUPPRIMER</Text> pour confirmer:
                        </Text>

                        <TextInput
                            style={styles.confirmInput}
                            value={deleteConfirmText}
                            onChangeText={setDeleteConfirmText}
                            placeholder="Tapez SUPPRIMER"
                            autoCapitalize="characters"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelModalButton]}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.deleteButton,
                                    deleteConfirmText !== 'SUPPRIMER' && styles.disabledButton
                                ]}
                                onPress={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'SUPPRIMER' || loading}
                            >
                                <Text style={styles.deleteButtonText}>
                                    {loading ? 'Suppression...' : 'Supprimer'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    dangerButton: {
        borderBottomWidth: 0,
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    dangerText: {
        color: '#ef4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginTop: 12,
    },
    modalText: {
        fontSize: 16,
        color: '#8E8E93',
        lineHeight: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    boldText: {
        fontWeight: '700',
        color: '#000',
    },
    confirmInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelModalButton: {
        backgroundColor: '#F2F2F7',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
    },
    disabledButton: {
        backgroundColor: '#fca5a5',
        opacity: 0.5,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 8,
    },
});

export default ProfileScreen;
