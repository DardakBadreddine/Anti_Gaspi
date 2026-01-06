import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileHeaderButton = ({ style }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { logout, user } = useAuth();
    const navigation = useNavigation();

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: () => {
                        setModalVisible(false);
                        logout();
                    }
                }
            ]
        );
    };

    const handleProfile = () => {
        setModalVisible(false);
        navigation.navigate('Profile');
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={[styles.button, style]}
            >
                <Text style={styles.icon}>👤</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userRole}>
                            {user?.role === 'merchant' ? '🏪 Commerçant' : '🛒 Client'}
                        </Text>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
                            <Text style={styles.menuText}>👤 Voir mon profil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <Text style={[styles.menuText, styles.logoutText]}>🚪 Se déconnecter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    icon: {
        fontSize: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e5e7eb',
        marginBottom: 20,
    },
    menuItem: {
        width: '100%',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    logoutText: {
        color: '#ef4444',
    },
    cancelButton: {
        marginTop: 20,
        paddingVertical: 12,
    },
    cancelText: {
        fontSize: 16,
        color: '#9ca3af',
        fontWeight: '600',
    },
});

export default ProfileHeaderButton;
