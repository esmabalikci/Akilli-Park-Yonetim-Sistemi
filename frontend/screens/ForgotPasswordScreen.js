import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl } from '../config/api';
import TurkishTextInput from '../components/TurkishTextInput';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (text) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(text);
    };

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Başarılı', data.message || 'Şifre sıfırlama talimatları e-posta adresinize gönderildi.', [
                    {
                        text: 'Tamam',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]);
            } else {
                Alert.alert('Hata', data.message || 'Bir sorun oluştu.');
            }
        } catch (error) {
            console.error('Şifre Sıfırlama hatası:', error);
            Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed-outline" size={80} color="#f39c12" />
                    </View>
                    <Text style={styles.title}>Şifremi Unuttum</Text>
                    <Text style={styles.subtitle}>
                        Kayıtlı e-posta adresinizi girin, size şifre sıfırlama talimatlarını gönderelim.
                    </Text>

                    <View style={styles.inputContainer}>
                        <TurkishTextInput
                            variant="email"
                            style={styles.input}
                            placeholder="E-posta"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading && <ActivityIndicator color="#fff" style={styles.loader} />}
                        <Text style={styles.buttonText}>
                            {loading ? 'Gönderiliyor...' : 'Şifreyi Sıfırla'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f6f8',
    },
    keyboardContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
        zIndex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 35,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#f39c12',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#f8c471',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loader: {
        marginRight: 10,
    },
});
