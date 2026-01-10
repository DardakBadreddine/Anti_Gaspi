import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

const DELIVERY_OPTIONS = [
    { value: 'pickup', label: 'Retrait en magasin', icon: 'storefront', fee: 0, description: 'Gratuit' },
    { value: 'morning_delivery', label: 'Livraison matin', icon: 'sunny', fee: 2, description: '6h - 12h' },
    { value: 'evening_delivery', label: 'Livraison soirée', icon: 'moon', fee: 3, description: '18h - 23h' },
];

const DeliveryOptionsModal = ({ visible, onClose, onSelect, basketPrice }) => {
    const [selectedOption, setSelectedOption] = useState('pickup');

    const handleConfirm = () => {
        const option = DELIVERY_OPTIONS.find(opt => opt.value === selectedOption);
        onSelect(option);
        onClose();
    };

    const selectedOpt = DELIVERY_OPTIONS.find(opt => opt.value === selectedOption);
    const totalPrice = basketPrice + (selectedOpt?.fee || 0);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Options de livraison</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.options}>
                        {DELIVERY_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    selectedOption === option.value && styles.selectedCard
                                ]}
                                onPress={() => setSelectedOption(option.value)}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={32}
                                    color={selectedOption === option.value ? '#22c55e' : '#6b7280'}
                                />
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionLabel}>{option.label}</Text>
                                    <Text style={styles.optionDescription}>{option.description}</Text>
                                </View>
                                <View style={styles.optionPrice}>
                                    <Text style={styles.fee}>
                                        {option.fee === 0 ? 'Gratuit' : `+${option.fee}€`}
                                    </Text>
                                    {selectedOption === option.value && (
                                        <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Prix du panier</Text>
                            <Text style={styles.summaryValue}>€{basketPrice.toFixed(2)}</Text>
                        </View>
                        {selectedOpt?.fee > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Frais de livraison</Text>
                                <Text style={styles.summaryValue}>€{selectedOpt.fee.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>€{totalPrice.toFixed(2)}</Text>
                        </View>
                    </View>

                    <Button title="Confirmer" onPress={handleConfirm} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
    },
    options: {
        marginBottom: 20,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    selectedCard: {
        borderColor: '#22c55e',
        backgroundColor: '#f0fdf4',
    },
    optionInfo: {
        flex: 1,
        marginLeft: 12,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    optionPrice: {
        alignItems: 'flex-end',
    },
    fee: {
        fontSize: 16,
        fontWeight: '600',
        color: '#22c55e',
        marginBottom: 4,
    },
    summary: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1f2937',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
        marginTop: 4,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#22c55e',
    },
});

export default DeliveryOptionsModal;
