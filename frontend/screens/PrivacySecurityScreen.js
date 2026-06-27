import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../utils/apiClient';
import TurkishTextInput from '../components/TurkishTextInput';

export default function PrivacySecurityScreen({ navigation }) {
  const { user, clearUser } = useUser();
  const { isDark } = useTheme();

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Tema Renkleri
  const bg = isDark ? '#0f172a' : '#ecfdf5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#10b981' : '#064e3b';
  const textSecondary = isDark ? '#94a3b8' : '#334155';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const modalBg = isDark ? '#0f172a' : '#ffffff';
  const inputBg = isDark ? '#1e293b' : '#ffffff';
  const inputBorder = isDark ? '#334155' : '#a7f3d0';
  const inputText = isDark ? '#f8fafc' : '#334155';

  useEffect(() => {
    load2FA();
  }, []);

  const load2FA = async () => {
    try {
      const val = await AsyncStorage.getItem('@apays_2fa');
      if (val === 'true') setIs2FAEnabled(true);
    } catch (e) {
      console.error(e);
    }
  };

  const toggle2FA = async () => {
    try {
      const newValue = !is2FAEnabled;
      setIs2FAEnabled(newValue);
      await AsyncStorage.setItem('@apays_2fa', newValue.toString());
      if (newValue) {
        Alert.alert('Aktif Edildi', 'İki faktörlü doğrulama başarıyla aktif edildi.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Uyarı', 'Lütfen tüm şifre alanlarını doldurun.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Uyarı', 'Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const { response, data } = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      if (response.ok && data.success) {
        Alert.alert('Başarılı', data.message);
        setPasswordModalVisible(false);
        setOldPassword('');
        setNewPassword('');
      } else {
        Alert.alert('Hata', data.message || 'Şifre değiştirilemedi.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kalıcı Olarak Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const { response, data } = await apiFetch('/api/auth/delete-account', {
                method: 'DELETE',
                body: JSON.stringify({}),
              });

              if (data.success) {
                Alert.alert('Silindi', data.message);
                clearUser();
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              } else {
                Alert.alert('Hata', data.message);
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary }]}>Gizlilik ve Güvenlik</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Ionicons name="shield-checkmark" size={32} color="#10b981" style={{ marginBottom: 12 }} />
          <Text style={[styles.heading, { color: textPrimary }]}>Verileriniz Güvende</Text>
          <Text style={[styles.paragraph, { color: textSecondary }]}>
            APAYS olarak kişisel verilerinizin gizliliğine ve güvenliğine büyük önem veriyoruz. Bilgileriniz şifrelenerek saklanmaktadır ve üçüncü şahıslarla paylaşılmamaktadır.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardBg, borderColor: borderCol }]}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Text style={[styles.settingText, { color: textSecondary }]}>Şifre Değiştir</Text>
          <Ionicons name="chevron-forward" size={20} color={textSecondary} />
        </TouchableOpacity>

        <View style={[styles.settingRow, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.settingText, { color: textSecondary }]}>İki Faktörlü Doğrulama</Text>
          <Switch
            trackColor={{ false: '#cbd5e1', true: '#34d399' }}
            thumbColor={is2FAEnabled ? '#10b981' : '#f8fafc'}
            onValueChange={toggle2FA}
            value={is2FAEnabled}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardBg, borderColor: borderCol, marginTop: 20 }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.settingText, { color: '#ef4444' }]}>Hesabı Sil</Text>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </ScrollView>

      {/* Şifre Değiştirme Modalı */}
      <Modal visible={isPasswordModalVisible} animationType="slide" transparent={true} onRequestClose={() => setPasswordModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Şifre Değiştir</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Mevcut Şifre</Text>
              <TurkishTextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
                placeholder="Mevcut şifrenizi girin"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Yeni Şifre</Text>
              <TurkishTextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
                placeholder="Yeni şifrenizi girin"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Şifreyi Güncelle</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  card: { borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  heading: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  paragraph: { fontSize: 14, lineHeight: 22 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  settingText: { fontSize: 15, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: '600' },
  input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1 },

  saveBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});
