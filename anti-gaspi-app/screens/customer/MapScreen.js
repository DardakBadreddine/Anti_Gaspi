import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Alert, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { searchBaskets } from '../../api/baskets';
import { getCurrentLocation } from '../../utils/location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
    const navigation = useNavigation();
    const mapRef = useRef(null);

    // State
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [initialRegion, setInitialRegion] = useState({
        latitude: 33.5731, // Default to Casablanca
        longitude: -7.5898,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Get User Location
            // 1. Get User Location
            const location = await getCurrentLocation();
            if (location) {
                setUserLocation(location);
                setInitialRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05, // Zoom level
                    longitudeDelta: 0.05 * ASPECT_RATIO,
                });

                // Animate to user location
                mapRef.current?.animateToRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05 * ASPECT_RATIO,
                }, 1000);
            }

            // 2. Fetch Shops (Standard Search with wide radius)
            // Use location if available, otherwise default
            const lat = location?.latitude || 33.5731;
            const lng = location?.longitude || -7.5898;

            const response = await searchBaskets(lat, lng, 50); // 50km radius
            if (response && response.shops) {
                setShops(response.shops);
            }
        } catch (error) {
            console.error('Map data load error:', error);
            Alert.alert('Erreur', 'Impossible de charger la carte');
        } finally {
            setLoading(false);
        }
    };

    const handleCalloutPress = (shop) => {
        navigation.navigate('ShopDetail', { shopId: shop.id, shop });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                key="map-v3-stable"
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
            >
                {shops.map((shop) => {
                    const hasPaniers = shop.paniers && shop.paniers.length > 0;
                    const panierCount = shop.paniers ? shop.paniers.length : 0;

                    return (
                        <Marker
                            key={shop.id}
                            coordinate={{
                                latitude: shop.latitude,
                                longitude: shop.longitude,
                            }}
                            title={shop.business_name}
                            description={hasPaniers ? `${panierCount} paniers disponibles` : "Aucun panier"}
                            pinColor={hasPaniers ? "green" : "wheat"}
                        >
                            <Callout onPress={() => handleCalloutPress(shop)}>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutHeader}>
                                        <Text style={styles.calloutTitle}>{shop.business_name}</Text>
                                        {shop.logo_url && (
                                            <Image
                                                source={{ uri: shop.logo_url }}
                                                style={styles.calloutImage}
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.calloutSubtitle}>
                                        {hasPaniers
                                            ? `📦 ${panierCount} paniers`
                                            : "🚫 Épuisé"}
                                    </Text>
                                    <Text style={styles.calloutInfo}>
                                        ⭐ {shop.rating?.toFixed(1) || 'N/A'} • {shop.distance?.toFixed(1) || '?'} km
                                    </Text>
                                    <View style={styles.calloutButton}>
                                        <Text style={styles.calloutButtonText}>Voir détails</Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Legend / Overlay controls could go here */}
            <View style={styles.refreshButtonContainer}>
                <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
                    <Ionicons name="refresh" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    // Custom Marker Styles
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        // Removed fixed width/height to allow label to grow
    },
    markerBubble: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 2,
    },
    activeMarker: {
        borderColor: '#22c55e',
        backgroundColor: '#f0fdf4', // Light green bg for active
    },
    inactiveMarker: {
        borderColor: '#8E8E93',
        backgroundColor: '#F2F2F7',
    },
    markerImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5, // Adjusted to be outside center relative
        backgroundColor: '#ef4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
        zIndex: 3,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    arrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -3, // Overlap slightly
        zIndex: 1,
        marginBottom: 2,
    },
    activeArrow: {
        borderTopColor: '#22c55e',
    },
    inactiveArrow: {
        borderTopColor: '#8E8E93',
    },
    labelContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        marginTop: 0,
    },
    labelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    calloutContainer: {
        width: 220,
        padding: 5,
    },
    calloutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    calloutImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 8,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
    },
    calloutSubtitle: {
        fontSize: 14,
        color: '#444',
        marginBottom: 2,
    },
    calloutInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    calloutButton: {
        backgroundColor: '#22c55e',
        borderRadius: 5,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginTop: 5,
    },
    calloutButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    refreshButtonContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    refreshButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default MapScreen;
