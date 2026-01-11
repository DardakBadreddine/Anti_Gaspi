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
    Modal,
    TextInput,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
    
    // Image states for merchants
    const [coverImageBase64, setCoverImageBase64] = useState(user?.cover_image_url || null);
    const [logoImageBase64, setLogoImageBase64] = useState(user?.logo_url || null);
    
    // Profile image for customers
    const [profileImageBase64, setProfileImageBase64] = useState(user?.profile_image_url || null);

    // Update form state when user changes (after profile update)
    useEffect(() => {
        if (user) {
            console.log('📱 ProfileScreen: User updated', {
                hasCoverImage: !!user.cover_image_url,
                hasLogo: !!user.logo_url,
                hasProfileImage: !!user.profile_image_url,
                role: user.role
            });
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setLocation({
                latitude: user.latitude || null,
                longitude: user.longitude || null
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);

        const updateData = {
            name,
            email,
            phone,
            address,
            latitude: location?.latitude,
            longitude: location?.longitude,
        };

        // Add image data for merchants
        if (user?.role === 'merchant') {
            if (coverImageBase64 !== null) {
                updateData.coverImageBase64 = coverImageBase64;
            }
            if (logoImageBase64 !== null) {
                updateData.logoImageBase64 = logoImageBase64;
            }
        }
        
        // Add profile image for customers
        if (user?.role === 'customer' && profileImageBase64 !== null) {
            updateData.profileImageBase64 = profileImageBase64;
        }

        const result = await update(updateData);

        setLoading(false);

        if (result.success) {
            // Reset image states after successful save so they use the URLs from user object
            // The user object in context will be updated by AuthContext
            setCoverImageBase64(null);
            setLogoImageBase64(null);
            setProfileImageBase64(null);
            
            Alert.alert('Succès', 'Profil mis à jour avec succès');
            setEditing(false);
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de mettre à jour le profil');
        }
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
                    {/* Cover Image for Merchants */}
                    {user?.role === 'merchant' && (coverImageBase64 || user?.cover_image_url) && (
                        <Image 
                            source={{ uri: coverImageBase64 || user.cover_image_url }} 
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    )}
                    
                    {/* Profile Image/Avatar */}
                    <TouchableOpacity 
                        style={styles.avatarContainer}
                        onPress={editing && (user?.role === 'customer' ? pickProfileImage : null)}
                        disabled={!editing || user?.role !== 'customer'}
                    >
                        {user?.role === 'merchant' && (logoImageBase64 || user?.logo_url) ? (
                            <Image 
                                source={{ uri: logoImageBase64 || user.logo_url }} 
                                style={styles.avatarImage}
                            />
                        ) : user?.role === 'customer' && (profileImageBase64 || user?.profile_image_url) ? (
                            <Image 
                                source={{ uri: profileImageBase64 || user.profile_image_url }} 
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Ionicons
                                name={user?.role === 'merchant' ? 'storefront' : 'person'}
                                size={48}
                                color="#22c55e"
                            />
                        )}
                        {editing && user?.role === 'customer' && (
                            <View style={styles.editAvatarBadge}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                    
                    <Text style={styles.userName}>
                        {user?.role === 'merchant' ? user?.business_name : user?.name}
                    </Text>
                    {user?.role === 'merchant' && user?.tagline && (
                        <Text style={styles.tagline}>"{user.tagline}"</Text>
                    )}
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    
                    {/* Rating for Merchants */}
                    {user?.role === 'merchant' && user?.rating > 0 && (
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#f59e0b" />
                            <Text style={styles.ratingText}>
                                {Number(user.rating).toFixed(1)}
                            </Text>
                        </View>
                    )}
                    
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

                    {editing && (user?.role === 'customer' || user?.role === 'merchant') && (
                        <>
                            <Text style={styles.label}>Adresse</Text>
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
                            {address && (
                                <Text style={styles.addressText}>{address}</Text>
                            )}
                        </>
                    )}

                    {!editing && address && (
                        <View style={styles.addressDisplay}>
                            <Ionicons name="location" size={16} color="#8E8E93" />
                            <Text style={styles.addressDisplayText}>{address}</Text>
                        </View>
                    )}

                    {editing && user?.role === 'merchant' && (
                        <>
                            {/* Cover Image */}
                            <Text style={styles.label}>Image de couverture</Text>
                            <TouchableOpacity onPress={pickCoverImage} style={styles.imagePicker}>
                                {(coverImageBase64 || user?.cover_image_url) ? (
                                    <Image 
                                        source={{ uri: coverImageBase64 || user.cover_image_url }} 
                                        style={styles.coverImagePreview} 
                                    />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="image-outline" size={32} color="#8E8E93" />
                                        <Text style={styles.imagePlaceholderText}>Ajouter une image de couverture</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Logo Image */}
                            <Text style={styles.label}>Logo</Text>
                            <TouchableOpacity onPress={pickLogoImage} style={styles.logoPicker}>
                                {(logoImageBase64 || user?.logo_url) ? (
                                    <Image 
                                        source={{ uri: logoImageBase64 || user.logo_url }} 
                                        style={styles.logoPreview} 
                                    />
                                ) : (
                                    <View style={styles.logoPlaceholder}>
                                        <Ionicons name="camera-outline" size={24} color="#8E8E93" />
                                        <Text style={styles.imagePlaceholderText}>Ajouter un logo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
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
                                    setLocation({
                                        latitude: user?.latitude,
                                        longitude: user?.longitude
                                    });
                                    setCoverImageBase64(user?.cover_image_url || null);
                                    setLogoImageBase64(user?.logo_url || null);
                                    setProfileImageBase64(user?.profile_image_url || null);
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
        overflow: 'hidden',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 120,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 20,
        borderWidth: 4,
        borderColor: '#fff',
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#22c55e',
        borderRadius: 12,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    tagline: {
        fontSize: 14,
        color: '#8E8E93',
        fontStyle: 'italic',
        marginTop: 4,
        marginBottom: 8,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        marginBottom: 12,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
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
    addressText: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
    },
    addressDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
    },
    addressDisplayText: {
        fontSize: 14,
        color: '#8E8E93',
        flex: 1,
    },
    imagePicker: {
        marginBottom: 16,
    },
    coverImagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
    },
    imagePlaceholder: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    logoPicker: {
        marginBottom: 16,
    },
    logoPreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F2F2F7',
        alignSelf: 'center',
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        alignSelf: 'center',
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },
});

export default ProfileScreen;
