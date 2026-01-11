import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Customer screens
import SearchScreen from '../screens/customer/SearchScreen';
import BasketDetailsScreen from '../screens/customer/BasketDetailsScreen';
import ReservationsScreen from '../screens/customer/ReservationsScreen';
import ReservationDetailScreen from '../screens/customer/ReservationDetailScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import MapScreen from '../screens/customer/MapScreen';
import ShopDetailScreen from '../screens/customer/ShopDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Merchant screens
import AddBasketScreen from '../screens/merchant/AddBasketScreen';
import MerchantBasketsScreen from '../screens/merchant/MerchantBasketsScreen';
import ScannerScreen from '../screens/merchant/ScannerScreen';
import MerchantReservationsScreen from '../screens/merchant/MerchantReservationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabs = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 0,
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: 10,
                    height: 60 + Math.max(insets.bottom, 8),
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginBottom: 2,
                }
            }}
        >
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Accueil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favoris',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Reservations"
                component={ReservationsScreen}
                options={{
                    tabBarLabel: 'Réservations',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{
                    tabBarLabel: 'Carte',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Merchant Tab Navigator
const MerchantTabs = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 0,
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: 10,
                    height: 60 + Math.max(insets.bottom, 8),
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginBottom: 2,
                }
            }}
        >
            <Tab.Screen
                name="MerchantBaskets"
                component={MerchantBasketsScreen}
                options={{
                    tabBarLabel: 'Mes Paniers',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="basket" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{
                    tabBarLabel: 'Scanner',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="qr-code" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="MerchantReservations"
                component={MerchantReservationsScreen}
                options={{
                    tabBarLabel: 'Réservations',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Main App Navigator
const AppNavigator = () => {
    const { user, isAuthenticated, loading } = useAuth();
    usePushNotifications();

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer>
            {!isAuthenticated ? (
                // Auth Stack
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Navigator>
            ) : user?.role === 'customer' ? (
                // Customer Stack
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
                    <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
                    <Stack.Screen name="BasketDetails" component={BasketDetailsScreen} />
                    <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} />
                </Stack.Navigator>
            ) : (
                // Merchant Stack
                <Stack.Navigator>
                    <Stack.Screen
                        name="MerchantHome"
                        component={MerchantTabs}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AddBasket"
                        component={AddBasketScreen}
                        options={{ title: 'Ajouter un panier' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{ title: 'Mon Profil' }}
                    />
                </Stack.Navigator>
            )
            }
        </NavigationContainer >
    );
};

export default AppNavigator;
