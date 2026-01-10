import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatsCard = ({ icon, iconColor, label, value, unit, backgroundColor }) => {
    return (
        <View style={[styles.card, backgroundColor && { backgroundColor }]}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon} size={28} color={iconColor} />
            </View>
            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>
                    {value} <Text style={styles.unit}>{unit}</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
    },
    unit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
});

export default StatsCard;
