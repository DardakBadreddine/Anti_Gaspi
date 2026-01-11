import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentLocation } from '../utils/location';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
    const [region, setRegion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initLocation = async () => {
            if (initialLocation) {
                setRegion({
                    latitude: initialLocation.latitude,
                    longitude: initialLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
                setLoading(false);
            } else {
                try {
                    const location = await getCurrentLocation();
                    if (location) {
                        setRegion({
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        });
                        onLocationSelect({
                            latitude: location.latitude,
                            longitude: location.longitude,
                        });
                    }
                } catch (error) {
                    console.log('Error getting location for picker:', error);
                    // Default to Casablanca
                    setRegion({
                        latitude: 33.5731,
                        longitude: -7.5898,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        initLocation();
    }, []);

    const handleRegionChangeComplete = (newRegion) => {
        setRegion(newRegion);
        onLocationSelect({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
        });
    };

    if (loading || !region) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={styles.loadingText}>Localisation...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {/* 
                   We don't strictly need a marker since we use a fixed center pin overlay 
                   But we can keep one if we want the pin to move with the map.
                   Better UX: Fixed pin in center of screen.
                */}
            </MapView>

            {/* Fixed Center Pin */}
            <View style={styles.markerFixed}>
                <Ionicons name="location-sharp" size={36} color="#22c55e" />
            </View>

            <View style={styles.hintContainer}>
                <Text style={styles.hintText}>Déplacez la carte pour placer l'épingle</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 200,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
    },
    loadingText: {
        marginTop: 8,
        color: '#8E8E93',
    },
    markerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -18,
        marginTop: -36,
        zIndex: 10,
    },
    hintContainer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        overflow: 'hidden',
    },
});

export default LocationPicker;
