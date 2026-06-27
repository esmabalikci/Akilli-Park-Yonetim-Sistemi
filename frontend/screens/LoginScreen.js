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
    Image,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl } from '../config/api';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import TurkishTextInput from '../components/TurkishTextInput';

const COLORS = {
    background: '#E1F5FE',
    primary: '#26A69A',
    primaryDark: '#00897B',
    title: '#00695C',
    subtitle: '#4DB6AC',
    inputBorder: '#E0E0E0',
    link: '#26A69A',
    iconPerson: '#1E88E5',
    iconLock: '#F9A825',
};

export default function LoginScreen({ navigation }) {
    const { setSession } = useUser();
    const { isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Tema renkleri
    const bg = isDark ? '#0f172a' : COLORS.background;
    const textColor = isDark ? '#10b981' : COLORS.title;
    const subTextColor = isDark ? '#94a3b8' : COLORS.subtitle;
    const inputBg = isDark ? '#1e293b' : '#fff';
    const inputBorder = isDark ? '#334155' : COLORS.inputBorder;
    const textInputColor = isDark ? '#e2e8f0' : '#333';
    const linkColor = isDark ? '#34d399' : COLORS.link;

    const validateEmail = (text) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(text);
    };

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Hata', 'Lütfen şifrenizi girin.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await setSession(data.user, data.token);
                navigation.replace('Home', { user: data.user });
            } else {
                Alert.alert('Hata', data.message || 'Giriş başarısız.');
            }
        } catch (error) {
            console.error('Login hatası:', error);
            Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Image
                        source={require('../assets/login-park.png')}
                        style={styles.headerImage}
                        resizeMode="cover"
                        accessibilityLabel="Park görseli"
                    />

                    <Text style={[styles.title, { color: textColor }]}>
                        Akıllı Piknik Alanı Yönetim Sistemi
                    </Text>
                    <Text style={[styles.subtitle, { color: subTextColor }]}>
                        Parkınızı şimdi kolayca rezerve edin!
                    </Text>

                    <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                        <Ionicons
                            name="person"
                            size={22}
                            color={COLORS.iconPerson}
                            style={styles.inputIcon}
                        />
                        <TurkishTextInput
                            variant="email"
                            style={[styles.input, { color: textInputColor }]}
                            placeholder="E-posta"
                            placeholderTextColor="#9E9E9E"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                        <Ionicons
                            name="lock-closed"
                            size={22}
                            color={COLORS.iconLock}
                            style={styles.inputIcon}
                        />
                        <TurkishTextInput
                            variant="password"
                            style={[styles.input, { color: textInputColor }]}
                            placeholder="Şifre"
                            placeholderTextColor="#9E9E9E"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color="#9E9E9E"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotLink}
                    >
                        <Text style={[styles.linkText, { color: linkColor }]}>Şifremi unuttum</Text>
                    </TouchableOpacity>

                    <View style={styles.registerRow}>
                        <Text style={[styles.registerText, { color: subTextColor }]}>Hesabın yok mu? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.registerLink, { color: linkColor }]}>Kayıt Ol</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 32,
        alignItems: 'center',
    },
    headerImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.title,
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 28,
        paddingHorizontal: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.subtitle,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        paddingHorizontal: 16,
        marginBottom: 14,
        minHeight: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 14,
    },
    eyeButton: {
        paddingLeft: 8,
    },
    button: {
        width: '100%',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#80CBC4',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotLink: {
        marginTop: 18,
    },
    linkText: {
        color: COLORS.link,
        fontSize: 15,
        fontWeight: '500',
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 14,
    },
    registerText: {
        fontSize: 15,
        color: '#546E7A',
    },
    registerLink: {
        fontSize: 15,
        color: COLORS.link,
        fontWeight: 'bold',
    },
});
