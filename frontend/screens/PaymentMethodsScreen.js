import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import TurkishTextInput from '../components/TurkishTextInput';
import { apiFetch } from '../utils/apiClient';

export default function PaymentMethodsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useUser();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const bg = isDark ? '#0f172a' : '#ecfdf5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#10b981' : '#064e3b';
  const textSecondary = isDark ? '#94a3b8' : '#059669';
  const inputBg = isDark ? '#1e293b' : '#ffffff';
  const inputBorder = isDark ? '#334155' : '#a7f3d0';
  const inputText = isDark ? '#f8fafc' : '#334155';
  const modalBg = isDark ? '#0f172a' : '#ffffff';
  const cardItemBg = isDark ? '#334155' : '#d1fae5';

  const loadCards = useCallback(async () => {
    if (!user?.id) {
      setCards([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { response, data } = await apiFetch('/api/payments/methods');
      if (response.ok) {
        setCards(data.methods || []);
      }
    } catch (e) {
      console.error('Kartlar yüklenemedi', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const handleAddCard = async () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Geçersiz', 'Geçerli bir 16 haneli kart numarası girin.');
      return;
    }

    try {
      const { response, data } = await apiFetch('/api/payments/methods', {
        method: 'POST',
        body: JSON.stringify({
          cardName,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiry,
          cvv,
          isDefault: cards.length === 0,
        }),
      });

      if (response.ok) {
        setModalVisible(false);
        setCardName('');
        setCardNumber('');
        setExpiry('');
        setCvv('');
        loadCards();
        Alert.alert('Başarılı', 'Kart sunucuya güvenli şekilde kaydedildi.');
      } else {
        Alert.alert('Hata', data.message || 'Kart eklenemedi.');
      }
    } catch (e) {
      Alert.alert('Hata', e.message || 'Bağlantı hatası.');
    }
  };

  const handleDeleteCard = (id) => {
    Alert.alert('Sil', 'Bu kartı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const { response } = await apiFetch(`/api/payments/methods/${id}`, {
              method: 'DELETE',
            });
            if (response.ok) loadCards();
          } catch (e) {
            Alert.alert('Hata', e.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary }]}>Ödeme Yöntemleri</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color={textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={textPrimary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {cards.length === 0 ? (
            <Text style={[styles.empty, { color: textSecondary }]}>
              Kayıtlı kart yok. Rezervasyon için kart ekleyin. Kart numarası sunucuda tokenize edilir; tam numara saklanmaz.
            </Text>
          ) : (
            cards.map((card) => (
              <View key={card.id} style={[styles.cardItem, { backgroundColor: cardItemBg }]}>
                <View>
                  <Text style={[styles.cardBrand, { color: textPrimary }]}>
                    {card.cardBrand} •••• {card.cardLastFour}
                  </Text>
                  <Text style={[styles.cardName, { color: textSecondary }]}>{card.cardName}</Text>
                  {card.isDefault && <Text style={styles.defaultBadge}>Varsayılan</Text>}
                </View>
                <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Yeni Kart Ekle</Text>
            <TurkishTextInput style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} placeholder="Kart Üzerindeki İsim" value={cardName} onChangeText={setCardName} />
            <TurkishTextInput style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} placeholder="Kart Numarası" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" maxLength={19} />
            <View style={styles.row}>
              <TurkishTextInput style={[styles.inputHalf, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} placeholder="AA/YY" value={expiry} onChangeText={setExpiry} />
              <TurkishTextInput style={[styles.inputHalf, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="number-pad" maxLength={4} secureTextEntry />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancelText, { color: textSecondary }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16 },
  empty: { textAlign: 'center', lineHeight: 22, marginTop: 24 },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardBrand: { fontSize: 16, fontWeight: '800' },
  cardName: { fontSize: 13, marginTop: 4 },
  defaultBadge: { fontSize: 11, color: '#059669', fontWeight: '700', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  saveBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800' },
  cancelText: { textAlign: 'center', marginTop: 14, fontWeight: '600' },
});
