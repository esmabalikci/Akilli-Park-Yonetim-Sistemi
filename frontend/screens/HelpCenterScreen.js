import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function HelpCenterScreen({ navigation }) {
  const { isDark } = useTheme();
  
  const faqs = [
    { q: 'Nasıl rezervasyon yapabilirim?', a: 'Park detay ekranındaki "Rezervasyon Yap" butonunu kullanarak tarih ve saat seçip rezervasyon oluşturabilirsiniz.' },
    { q: 'Rezervasyonumu iptal edebilir miyim?', a: 'Rezervasyonlarım sekmesinden mevcut rezervasyonlarınızı görüntüleyip iptal edebilirsiniz.' },
    { q: 'Favori parklarımı nasıl görebilirim?', a: 'Alt menüdeki Favoriler sekmesine tıklayarak beğendiğiniz parkları listeleyebilirsiniz.' },
    { q: 'Şifremi unuttum, ne yapmalıyım?', a: 'Giriş ekranında bulunan "Şifremi Unuttum" seçeneğine tıklayarak kayıtlı e-posta adresinize sıfırlama bağlantısı gönderebilirsiniz.' },
    { q: 'Kişisel bilgilerimi nasıl güncellerim?', a: 'Profil sekmesine gidip "Kişisel Bilgiler" seçeneğine tıklayarak ad, soyad ve e-posta bilgilerinizi güncelleyebilirsiniz.' },
    { q: 'Ödeme yöntemlerimi nasıl yönetirim?', a: 'Profil menüsünde yer alan "Ödeme Yöntemleri" kısmından yeni kredi veya banka kartı ekleyebilir ve silebilirsiniz.' },
    { q: 'Uygulama karanlık temayı destekliyor mu?', a: 'Evet, Ayarlar sekmesi altından Tema Tercihi kısmından Karanlık veya Açık temayı seçebilirsiniz.' },
    { q: 'Hangi parklarda hangi etkinlikler var?', a: 'Etkinlikler sekmesini ziyaret ederek, bulunduğunuz veya seçtiğiniz ilçedeki parklarda yaklaşan etkinlikleri görebilirsiniz.' },
    { q: 'Kayıp eşyamı nerede bulabilirim?', a: 'Ana ekrandaki "Kayıp/Bulunan" sekmesine girerek, parklarda bulunmuş olan eşyaları listeleyebilir veya kendi kayıp ilanınızı oluşturabilirsiniz.' },
  ];

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Tema Renkleri
  const bg = isDark ? '#0f172a' : '#ecfdf5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#10b981' : '#064e3b';
  const textSecondary = isDark ? '#94a3b8' : '#334155';
  const textTitle = isDark ? '#34d399' : '#047857';

  const handleToggleFaq = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary }]}>Yardım Merkezi</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: textTitle }]}>Sıkça Sorulan Sorular</Text>
        {faqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.faqCard, { backgroundColor: cardBg }]}
              onPress={() => handleToggleFaq(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQ, { color: textPrimary }]}>{faq.q}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={textPrimary} />
              </View>
              {isExpanded && (
                <View style={styles.faqBody}>
                  <Text style={[styles.faqA, { color: textSecondary }]}>{faq.a}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  
  faqCard: { borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#10b981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  faqBody: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  faqA: { fontSize: 14, lineHeight: 20 },
});
