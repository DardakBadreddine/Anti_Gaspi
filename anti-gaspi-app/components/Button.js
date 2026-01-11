import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style
}) => {
    const buttonStyle = [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        disabled && styles.disabledButton,
        style,
    ];

    const textStyle = [
        styles.text,
        variant === 'primary' && styles.primaryText,
        variant === 'secondary' && styles.secondaryText,
        variant === 'danger' && styles.dangerText,
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    primaryButton: {
        backgroundColor: '#22c55e',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
    },
    dangerButton: {
        backgroundColor: '#ef4444',
    },
    disabledButton: {
        backgroundColor: '#d1d5db',
        opacity: 0.6,
    },
    text: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    primaryText: {
        color: '#fff',
    },
    secondaryText: {
        color: '#000',
    },
    dangerText: {
        color: '#fff',
    },
});

export default Button;
