import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Customer screens
import SearchScreen from '../screens/customer/SearchScreen';
import BasketDetailsScreen from '../screens/customer/BasketDetailsScreen';
import ReservationsScreen from '../screens/customer/ReservationsScreen';

// Merchant screens
import AddBasketScreen from '../screens/merchant/AddBasketScreen';
import MerchantBasketsScreen from '../screens/merchant/MerchantBasketsScreen';
import ScannerScreen from '../screens/merchant/ScannerScreen';
import MerchantReservationsScreen from '../screens/merchant/MerchantReservationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                    paddingTop: 10,
                    height: Platform.OS === 'ios' ? 85 : 70,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: Platform.OS === 'ios' ? 0 : 5,
                }
            }}
        >
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Rechercher',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Reservations"
                component={ReservationsScreen}
                options={{
                    tabBarLabel: 'Mes Réservations',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Merchant Tab Navigator
const MerchantTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                    paddingTop: 10,
                    height: Platform.OS === 'ios' ? 85 : 70,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: Platform.OS === 'ios' ? 0 : 5,
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
                        <Ionicons name="clipboard" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Main App Navigator
const AppNavigator = () => {
    const { user, isAuthenticated, loading } = useAuth();

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
                <Stack.Navigator>
                    <Stack.Screen
                        name="CustomerHome"
                        component={CustomerTabs}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="BasketDetails"
                        component={BasketDetailsScreen}
                        options={{ title: 'Détails du panier' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{ title: 'Mon Profil' }}
                    />
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
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
