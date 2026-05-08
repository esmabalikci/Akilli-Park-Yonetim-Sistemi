import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getApiBaseUrl } from '../config/api';

// İsteğe bağlı: Kullanıcı bilgilerini tuttuğunuz bir Auth Context veya Global State import edebilirsiniz.
// Örneğin: import { useAuth } from '../context/AuthContext';

export default function ParkDetailScreen({ route, navigation }) {
  const { park } = route.params;

  // Eğer Context API kullanıyorsanız:
  // const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // Varsayılan 1 saat

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');

    if (mode === 'date') {
      setDate(currentDate);
      setMode('time');
      setShow(true);
    } else {
      setStartTime(currentDate);
      const newEndTime = new Date(currentDate.getTime() + 60 * 60 * 1000);
      setEndTime(newEndTime);
      setShow(false);
      setMode('date');
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const handleReservation = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      console.log('Bağlanılan Adres:', `${baseUrl}/api/reservations`);

      // Kullanıcının oturum bilgilerine göre UserId alanını şekillendiriyoruz.
      // Eğer kullanıcı ID'niz bir global state veya context'te tutuluyorsa user.id olarak güncelleyebilirsiniz.
      const currentUserId = 1; // user?.id || 1; 

      const requestBody = {
        UserId: currentUserId,
        PicnicAreaId: park.id || park.Id || 1,
        StartTime: startTime.toISOString(),
        EndTime: endTime.toISOString(),
        Status: 'Aktif',
        CreatedAt: new Date().toISOString(),
      };

      console.log('Gönderilen JSON Verisi:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('Sunucu Yanıt Kodu:', response.status);
      console.log('Sunucu Yanıt Metni:', responseText);

      if (response.ok) {
        setModalVisible(false);
        Alert.alert(
          'Başarılı',
          'Rezervasyonunuz veritabanına kaydedildi.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('ReservationScreen', { park }),
            },
          ]
        );
      } else {
        Alert.alert('Hata', 'Kayıt başarısız: ' + responseText);
      }
    } catch (error) {
      console.error('Bağlantı Hatası Detayı:', error);
      Alert.alert('Hata', 'Sunucuya bağlanılamadı. Hata: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: park.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{park.name}</Text>
          <View
            style={[
              styles.statusBadge,
              typeof park.occupancyRate === 'number' && park.occupancyRate > 90
                ? styles.statusDolu
                : styles.statusMusait,
            ]}
          >
            <Text style={styles.statusText}>{park.status}</Text>
          </View>
        </View>

        <Text style={styles.location}>📍 {park.location}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Uzaklık</Text>
            <Text style={styles.infoValue}>{park.distance ? `${park.distance} km` : 'Bilinmiyor'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Boyut</Text>
            <Text style={styles.infoValue}>
              {typeof park.size_sqm === 'number' ? `${park.size_sqm} m²` : 'Bilinmiyor'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kapasite</Text>
            <Text style={styles.infoValue}>
              {typeof park.capacity === 'number' ? `${park.capacity} Kişi` : 'Bilinmiyor'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Doluluk</Text>
            <Text style={styles.infoValue}>
              {typeof park.occupancyRate === 'number' ? `%${park.occupancyRate}` : 'Bilinmiyor'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Açıklama</Text>
        <Text style={styles.description}>{park.description}</Text>

        <TouchableOpacity style={styles.reserveButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.reserveButtonText}>Rezervasyon Yap</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Rezervasyon Formu</Text>

            <View style={styles.formGroup}>
              <TouchableOpacity style={styles.pickerButton} onPress={() => showMode('date')}>
                <Text style={styles.pickerButtonText}>Tarih ve Saat Seç</Text>
              </TouchableOpacity>

              <Text style={styles.selectedText}>
                Başlangıç: {startTime.toLocaleString('tr-TR')}
              </Text>
              <Text style={styles.selectedText}>
                Bitiş: {endTime.toLocaleString('tr-TR')} (1 Saat)
              </Text>
            </View>

            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={onChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.btn, styles.btnConfirm]}
                onPress={handleReservation}
              >
                <Text style={styles.btnText}>Rezervasyon Onayla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#124d57',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusMusait: {
    backgroundColor: '#d1fae5',
  },
  statusDolu: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#124d57',
  },
  location: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
  },
  infoItem: {
    width: '48%',
    padding: 10,
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 20,
  },
  reserveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#124d57',
    marginBottom: 15,
  },
  formGroup: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 15,
  },
  pickerButton: {
    backgroundColor: '#124d57',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  pickerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedText: {
    fontSize: 14,
    color: '#334155',
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  btnConfirm: {
    backgroundColor: '#10b981',
  },
  btnCancel: {
    backgroundColor: '#ef4444',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});