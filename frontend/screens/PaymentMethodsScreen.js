import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import TurkishTextInput from '../components/TurkishTextInput';

const CARDS_STORAGE_KEY = '@apays_saved_cards';

export default function PaymentMethodsScreen({ navigation }) {
  const { isDark } = useTheme();
  
  const [cards, setCards] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Yeni Kart State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Tema Renkleri
  const bg = isDark ? '#0f172a' : '#ecfdf5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#10b981' : '#064e3b';
  const textSecondary = isDark ? '#94a3b8' : '#059669';
  const inputBg = isDark ? '#1e293b' : '#ffffff';
  const inputBorder = isDark ? '#334155' : '#a7f3d0';
  const inputText = isDark ? '#f8fafc' : '#334155';
  const modalBg = isDark ? '#0f172a' : '#ffffff';
  const cardItemBg = isDark ? '#334155' : '#d1fae5';

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
      if (data) {
        setCards(JSON.parse(data));
      }
    } catch (e) {
      console.error('Kartlar yüklenemedi', e);
    }
  };

  const saveCards = async (newCards) => {
    try {
      await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(newCards));
      setCards(newCards);
    } catch (e) {
      console.error('Kartlar kaydedilemedi', e);
    }
  };

  const handleAddCard = () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Geçersiz', 'Geçerli bir 16 haneli kart numarası girin.');
      return;
    }

    const newCard = {
      id: Date.now().toString(),
      name: cardName,
      number: cardNumber,
      expiry: expiry,
      type: cardNumber.startsWith('4') ? 'visa' : 'mastercard'
    };

    const updatedCards = [...cards, newCard];
    saveCards(updatedCards);
    closeModal();
    Alert.alert('Başarılı', 'Kartınız başarıyla eklendi.');
  };

  const handleRemoveCard = (id) => {
    Alert.alert(
      'Kartı Sil',
      'Bu kartı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            const updated = cards.filter(c => c.id !== id);
            saveCards(updated);
          }
        }
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted.substring(0, 19));
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const maskCardNumber = (num) => {
    const clean = num.replace(/\s/g, '');
    const last4 = clean.slice(-4);
    return `**** **** **** ${last4}`;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary }]}>Ödeme Yöntemleri</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={cards.length === 0 ? styles.contentEmpty : styles.content}>
        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={isDark ? '#475569' : '#a7f3d0'} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>Kayıtlı Ödeme Yöntemi Yok</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>Henüz bir kredi kartı veya banka kartı eklemediniz.</Text>
          </View>
        ) : (
          cards.map(card => (
            <View key={card.id} style={[styles.cardItem, { backgroundColor: cardItemBg }]}>
              <View style={styles.cardHeader}>
                <Ionicons 
                  name={card.type === 'visa' ? 'logo-venmo' : 'card'} 
                  size={24} 
                  color={textPrimary} 
                />
                <TouchableOpacity onPress={() => handleRemoveCard(card.id)} hitSlop={12}>
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.cardNumber, { color: textPrimary }]}>{maskCardNumber(card.number)}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardName, { color: textSecondary }]}>{card.name}</Text>
                <Text style={[styles.cardExpiry, { color: textSecondary }]}>{card.expiry}</Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Yeni Kart Ekle</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Kart Ekleme Modalı */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Kart Bilgileri</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Kart Üzerindeki İsim</Text>
              <TurkishTextInput 
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} 
                placeholder="Örn: John Doe"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Kart Numarası</Text>
              <TurkishTextInput 
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} 
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.label, { color: textSecondary }]}>SKT</Text>
                <TurkishTextInput 
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} 
                  placeholder="AA/YY"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  keyboardType="numeric"
                  value={expiry}
                  onChangeText={handleExpiryChange}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: textSecondary }]}>CVV</Text>
                <TurkishTextInput 
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]} 
                  placeholder="123"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
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
  contentEmpty: { padding: 20, flex: 1, justifyContent: 'center' },
  content: { padding: 20 },
  emptyState: { alignItems: 'center', marginBottom: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
  
  cardItem: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardNumber: { fontSize: 20, fontWeight: '600', letterSpacing: 2, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardName: { fontSize: 14, fontWeight: '500', textTransform: 'uppercase' },
  cardExpiry: { fontSize: 14, fontWeight: '600' },

  btn: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: '600' },
  input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1 },
  row: { flexDirection: 'row' },
  
  saveBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});
