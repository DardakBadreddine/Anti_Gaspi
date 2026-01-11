import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Erreur', result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Image 
                        source={require('../../assets/images/antigaspiLogo.png')} 
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Anti-Gaspi</Text>
                    <Text style={styles.subtitle}>Réduisons le gaspillage alimentaire ensemble</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="votre@email.com"
                        keyboardType="email-address"
                        style={styles.input}
                    />

                    <Input
                        label="Mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry
                        style={styles.input}
                    />

                    <Button
                        title="Se connecter"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <Button
                        title="Créer un compte"
                        onPress={() => navigation.navigate('Register')}
                        variant="secondary"
                        style={styles.registerButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 72,
        marginBottom: 20,
    },
    logoImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 24,
        overflow: 'hidden',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#000',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 20,
    },
    loginButton: {
        marginTop: 8,
        marginBottom: 16,
    },
    registerButton: {
        marginBottom: 0,
    },
});

export default LoginScreen;
