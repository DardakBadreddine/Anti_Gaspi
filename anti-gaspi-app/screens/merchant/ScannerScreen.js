import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { validateReservation } from '../../api/reservations';
import Button from '../../components/Button';

const ScannerScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [validating, setValidating] = useState(false);
    const lastScannedRef = useRef({ code: null, time: 0 });

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ data }) => {
        // Prevent duplicate scans
        if (scanned || validating) {
            console.log('⏸️ Scan blocked: already processing');
            return;
        }

        const now = Date.now();
        // Prevent scanning the same code within 3 seconds
        if (lastScannedRef.current.code === data && now - lastScannedRef.current.time < 3000) {
            console.log('⏸️ Scan blocked: duplicate within 3 seconds');
            return;
        }

        console.log('📷 QR Code scanned:', data);
        lastScannedRef.current = { code: data, time: now };

        setScanned(true);
        setValidating(true);

        try {
            await validateReservation(data);
            Alert.alert(
                '✅ Succès',
                'Réservation validée avec succès !',
                [
                    {
                        text: 'Scanner un autre',
                        onPress: () => {
                            setScanned(false);
                            setValidating(false);
                        },
                    },
                    {
                        text: 'Retour',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'QR Code invalide';
            Alert.alert(
                '❌ Erreur',
                errorMsg,
                [
                    {
                        text: 'Réessayer',
                        onPress: () => {
                            setScanned(false);
                            setValidating(false);
                        },
                    },
                ]
            );
        }
    };

    if (!permission) {
        // Camera permissions are still loading
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Chargement...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>📷</Text>
                <Text style={styles.title}>Accès à la caméra refusé</Text>
                <Text style={styles.subtitle}>
                    Veuillez autoriser l'accès à la caméra dans les paramètres
                </Text>
                <Button
                    title="Autoriser la caméra"
                    onPress={requestPermission}
                    style={styles.button}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.topOverlay}>
                        <Text style={styles.instructionText}>
                            Scannez le QR code du client
                        </Text>
                    </View>

                    <View style={styles.scanArea}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    <View style={styles.bottomOverlay}>
                        {scanned && (
                            <View style={styles.validatingContainer}>
                                <Text style={styles.validatingText}>Validation en cours...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    scanArea: {
        width: 300,
        height: 300,
        alignSelf: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#22c55e',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    validatingContainer: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    validatingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    message: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    button: {
        minWidth: 200,
    },
});

export default ScannerScreen;
