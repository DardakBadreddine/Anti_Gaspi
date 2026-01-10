import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Jasmine',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Leo',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Sophie',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Charlie',
];

const ProfilePhotoPicker = ({ selectedPhoto, onSelectPhoto, visible, onClose }) => {
    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.modal}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choisir une photo de profil</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView contentContainerStyle={styles.grid}>
                    {AVATAR_OPTIONS.map((uri, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.avatarOption,
                                selectedPhoto === uri && styles.selectedAvatar
                            ]}
                            onPress={() => {
                                onSelectPhoto(uri);
                                onClose();
                            }}
                        >
                            <Image source={{ uri }} style={styles.avatarImage} />
                            {selectedPhoto === uri && (
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    avatarOption: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'transparent',
        overflow: 'hidden',
        position: 'relative',
    },
    selectedAvatar: {
        borderColor: '#22c55e',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    checkmark: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
});

export default ProfilePhotoPicker;
