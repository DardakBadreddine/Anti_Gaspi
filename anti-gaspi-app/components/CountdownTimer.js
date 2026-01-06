import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ expiresAt, compact = false }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const expiry = new Date(expiresAt);
            const diff = expiry - now;
            return Math.max(0, Math.floor(diff / 1000)); // seconds
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m ${secs}s`;
    };

    const getTimerColor = () => {
        const minutes = timeLeft / 60;
        if (minutes > 30) return '#22c55e'; // Green
        if (minutes > 10) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    if (timeLeft <= 0) {
        return (
            <View style={[styles.container, compact && styles.compactContainer, { backgroundColor: compact ? 'transparent' : '#fee2e2' }]}>
                <Text style={[styles.text, compact && styles.compactText, { color: '#ef4444' }]}>⏰ Exp.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, compact && styles.compactContainer, { backgroundColor: compact ? 'transparent' : `${getTimerColor()}20` }]}>
            <Text style={[styles.text, compact && styles.compactText, { color: getTimerColor() }]}>
                ⏱️ {formatTime(timeLeft)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    compactContainer: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderRadius: 0,
    },
    text: {
        fontSize: 14,
        fontWeight: '700',
    },
    compactText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default CountdownTimer;
