import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { getApiBaseUrl } from '../config/api';
import TurkishTextInput from '../components/TurkishTextInput';

export default function PersonalInfoScreen({ navigation }) {
  const { user, setUser } = useUser();
  const { isDark } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  // Tema Renkleri
  const bg = isDark ? '#0f172a' : '#ecfdf5';
  const textPrimary = isDark ? '#10b981' : '#064e3b';
  const textLabel = isDark ? '#34d399' : '#059669';
  const inputBg = isDark ? '#1e293b' : '#ffffff';
  const inputBorder = isDark ? '#334155' : '#a7f3d0';
  const inputText = isDark ? '#f8fafc' : '#334155';

  const handleUpdate = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Uyarı', 'Lütfen ad soyad ve e-posta alanlarını doldurun.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: fullName.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsEditing(false); // Başarılı olunca düzenleme modundan çık
        Alert.alert('Başarılı', data.message);
      } else {
        Alert.alert('Hata', data.message || 'Güncelleme başarısız oldu.');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      Alert.alert('Hata', 'Sunucu ile iletişim kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Değişiklikleri iptal et ve önceki duruma dön
    setFullName(user?.full_name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary }]}>Kişisel Bilgiler</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textLabel }]}>Ad Soyad</Text>
          <TurkishTextInput 
            style={[
              styles.input, 
              { backgroundColor: isEditing ? inputBg : (isDark ? '#0f172a' : '#f8fafc'), borderColor: inputBorder, color: inputText },
              !isEditing && { opacity: 0.8 }
            ]} 
            value={fullName} 
            onChangeText={setFullName} 
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            editable={isEditing}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textLabel }]}>E-posta</Text>
          <TurkishTextInput 
            style={[
              styles.input, 
              { backgroundColor: isEditing ? inputBg : (isDark ? '#0f172a' : '#f8fafc'), borderColor: inputBorder, color: inputText },
              !isEditing && { opacity: 0.8 }
            ]} 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            editable={isEditing}
          />
        </View>

        {!isEditing ? (
          <TouchableOpacity 
            style={styles.btn} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.btnText}>Bilgileri Düzenle</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.cancelBtn, isDark && { backgroundColor: '#334155' }]} 
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={[styles.btnText, styles.cancelBtnText, isDark && { color: '#f8fafc' }]}>İptal Et</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, styles.saveBtn, loading && { opacity: 0.7 }]} 
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ecfdf5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#064e3b' },
  content: { padding: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#059669', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, fontSize: 16, color: '#334155', borderWidth: 1, borderColor: '#a7f3d0' },
  btn: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', marginTop: 0, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cancelBtnText: { color: '#475569' },
  saveBtn: { flex: 1, marginTop: 0 },
});
