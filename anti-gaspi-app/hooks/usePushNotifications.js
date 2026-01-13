import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import apiClient from '../api/client';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const usePushNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Permission not granted for push notifications');
                return;
            }

            // Get the token
            try {
                // Project ID is sometimes required in bare workflow or specific managed configs
                // const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
                token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log('Expo Push Token:', token);
            } catch (error) {
                console.log('Error getting push token (Expected in Expo Go):', error.message);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    const saveTokenToBackend = async (token) => {
        if (!token) return;
        try {
            await apiClient.post('/push-tokens', {
                token: token,
                platform: Platform.OS
            });
            console.log('Push token saved to backend');
        } catch (error) {
            console.error('Error saving push token:', error);
        }
    };

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token) {
                saveTokenToBackend(token);
            }
        });

        // Listener for received notifications (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        // Listener for user interaction (tapping notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification tapped:', response);
            // Handle navigation here if needed
        });

        return () => {
            // Remove listeners using the .remove() method
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
    };
};
