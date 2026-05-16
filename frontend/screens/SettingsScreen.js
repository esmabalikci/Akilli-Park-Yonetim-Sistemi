import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  const [emailNotif, setEmailNotif] = React.useState(true);

  // Tema renkleri
  const bg = isDark ? '#0f172a' : '#ecfdf5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textTitle = isDark ? '#10b981' : '#064e3b';
  const textBody = isDark ? '#e2e8f0' : '#334155';
  const sectionTitleColor = isDark ? '#34d399' : '#059669';
  const borderColor = isDark ? '#334155' : 'transparent';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={textTitle} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textTitle }]}>Ayarlar</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Genel</Text>
        
        <View style={[styles.settingRow, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <Text style={[styles.settingText, { color: textBody }]}>Karanlık Tema</Text>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme} 
            trackColor={{ false: '#cbd5e1', true: '#10b981' }}
          />
        </View>

        <View style={[styles.settingRow, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <Text style={[styles.settingText, { color: textBody }]}>E-posta Bildirimleri</Text>
          <Switch 
            value={emailNotif} 
            onValueChange={setEmailNotif} 
            trackColor={{ false: '#cbd5e1', true: '#10b981' }}
          />
        </View>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <Text style={[styles.settingText, { color: textBody }]}>Uygulama Dili</Text>
          <View style={styles.rowRight}>
            <Text style={styles.settingValue}>Türkçe</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Hakkında</Text>
        
        <TouchableOpacity style={[styles.settingRow, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <Text style={[styles.settingText, { color: textBody }]}>Uygulama Sürümü</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <Text style={[styles.settingText, { color: textBody }]}>Kullanım Koşulları</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ecfdf5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#064e3b' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#059669', marginTop: 10, marginBottom: 10, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#10b981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  settingText: { fontSize: 15, fontWeight: '600', color: '#334155' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 14, color: '#64748b', marginRight: 8 },
});
