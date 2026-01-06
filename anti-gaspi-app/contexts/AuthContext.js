import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user data from storage on mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authApi.login(email, password);

            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            setToken(response.token);
            setUser(response.user);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur de connexion'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authApi.register(userData);

            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            setToken(response.token);
            setUser(response.user);

            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur lors de l\'inscription'
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const update = async (userData) => {
        try {
            const response = await authApi.updateProfile(userData);
            const updatedUser = response.user;

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            return { success: true };
        } catch (error) {
            console.error('Update error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur lors de la mise à jour'
            };
        }
    };

    const deleteAccount = async () => {
        try {
            await authApi.deleteAccount();
            await logout();
            return { success: true };
        } catch (error) {
            console.error('Delete error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur lors de la suppression'
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        update,
        deleteAccount,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
