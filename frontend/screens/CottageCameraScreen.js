import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getApiBaseUrl } from '../config/api';
import { useUser } from '../context/UserContext';
import WeatherCard from '../components/WeatherCard';
import { fetchParkWeatherForDateTime, getParkCoords } from '../utils/weather';
import { apiFetch } from '../utils/apiClient';
import { getParkKey } from '../utils/parkKey';

import cameraDemo from '../assets/camera-demo.mp4';

export default function CottageCameraScreen({ route, navigation }) {
  const { park, cottage } = route.params;
  const { user } = useUser();

  const [isEmpty, setIsEmpty] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000));

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [pickerType, setPickerType] = useState('start');
  const [reservationWeather, setReservationWeather] = useState(null);
  const [reservationWeatherLoading, setReservationWeatherLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [reservationFee, setReservationFee] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const loadReservationWeather = useCallback(async () => {
    if (!modalVisible || !getParkCoords(park)) {
      setReservationWeather(null);
      return;
    }
    try {
      setReservationWeatherLoading(true);
      const data = await fetchParkWeatherForDateTime(park, startTime);
      setReservationWeather(data);
    } catch {
      setReservationWeather(null);
    } finally {
      setReservationWeatherLoading(false);
    }
  }, [park, startTime, modalVisible]);

  useEffect(() => {
    loadReservationWeather();
  }, [loadReservationWeather]);

  const loadPaymentData = useCallback(async () => {
    if (!modalVisible || !user?.id) return;
    try {
      const [methodsRes, feeRes] = await Promise.all([
        apiFetch('/api/payments/methods'),
        apiFetch('/api/payments/fee'),
      ]);
      if (methodsRes.response.ok) {
        setPaymentMethods(methodsRes.data.methods || []);
        const defaultCard = methodsRes.data.methods?.find((m) => m.isDefault);
        setSelectedPaymentId(defaultCard?.id || methodsRes.data.methods?.[0]?.id || null);
      }
      if (feeRes.response.ok) {
        setReservationFee(feeRes.data.amount || 50);
      }
    } catch (e) {
      console.error('Ödeme bilgileri yüklenemedi:', e);
    }
  }, [modalVisible, user?.id]);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  const handleVideoStatus = (status) => {
    if (status.didJustFinish) {
      setIsEmpty(true);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('tr-TR');
  };

  const getReservationDuration = () => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes <= 0) {
      return 'Lütfen geçerli bir saat aralığı seçin.';
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} saat ${minutes} dakikalık rezervasyon seçtiniz.`;
    }

    if (hours > 0) {
      return `${hours} saatlik rezervasyon seçtiniz.`;
    }

    return `${minutes} dakikalık rezervasyon seçtiniz.`;
  };

  const openPicker = (type) => {
    setPickerType(type);
    setPickerMode('date');
    setShowPicker(true);
  };

  const onPickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android' && event?.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || new Date();

    if (pickerMode === 'date') {
      if (pickerType === 'start') {
        const newStart = new Date(startTime);
        newStart.setFullYear(currentDate.getFullYear());
        newStart.setMonth(currentDate.getMonth());
        newStart.setDate(currentDate.getDate());
        setStartTime(newStart);
      } else {
        const newEnd = new Date(endTime);
        newEnd.setFullYear(currentDate.getFullYear());
        newEnd.setMonth(currentDate.getMonth());
        newEnd.setDate(currentDate.getDate());
        setEndTime(newEnd);
      }

      setPickerMode('time');
      setShowPicker(true);
      return;
    }

    if (pickerMode === 'time') {
      if (pickerType === 'start') {
        const newStart = new Date(startTime);
        newStart.setHours(currentDate.getHours());
        newStart.setMinutes(currentDate.getMinutes());
        setStartTime(newStart);

        if (endTime <= newStart) {
          setEndTime(new Date(newStart.getTime() + 60 * 60 * 1000));
        }
      } else {
        const newEnd = new Date(endTime);
        newEnd.setHours(currentDate.getHours());
        newEnd.setMinutes(currentDate.getMinutes());
        setEndTime(newEnd);
      }

      setShowPicker(false);
      setPickerMode('date');
    }
  };

  const handleConfirmReservation = async () => {
    if (!user?.id) {
      Alert.alert('Giriş gerekli', 'Rezervasyon için lütfen giriş yapın.');
      return;
    }
    if (endTime <= startTime) {
      Alert.alert('Uyarı', 'Bitiş zamanı başlangıç zamanından sonra olmalıdır.');
      return;
    }
    if (!selectedPaymentId) {
      Alert.alert(
        'Ödeme yöntemi gerekli',
        'Rezervasyon için Profil > Ödeme Yöntemleri bölümünden kart ekleyin.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const { response, data } = await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          PicnicAreaId: getParkKey(park),
          ParkName: park?.name || 'Park',
          CottageName: cottage?.name || 'Çardak',
          StartTime: startTime.toISOString(),
          EndTime: endTime.toISOString(),
          Status: 'Onaylandı',
          PaymentMethodId: selectedPaymentId,
        }),
      });

      if (response.ok && data.success !== false) {
        setModalVisible(false);
        navigation.navigate('ReservationScreen');
        return;
      }

      Alert.alert('Hata', data.message || 'Rezervasyon kaydedilemedi.');
    } catch (error) {
      console.error('Rezervasyon kayıt hatası:', error);
      Alert.alert('Hata', error.message || 'Sunucuya bağlanılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={26} color="#064e3b" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Kamera İncelemesi</Text>

        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.parkName}>{park?.name || 'Park'}</Text>
        <Text style={styles.cottageName}>{cottage?.name}</Text>

        <View style={styles.cameraBox}>
          <Video
            source={cameraDemo}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            shouldPlay
            onPlaybackStatusUpdate={handleVideoStatus}
          />
        </View>

        <View
          style={[
            styles.statusBox,
            isEmpty ? styles.emptyBox : styles.fullBox,
          ]}
        >
          <Text style={styles.statusTitle}>
            {isEmpty ? 'BOŞALDI' : 'DOLU'}
          </Text>

          <Text style={styles.statusText}>
            {isEmpty
              ? 'Canlı kamera analizi tamamlandı. Çardakta herhangi bir kişi tespit edilmedi. Alan şu anda boş görünüyor. Rezervasyon işlemini başlatabilirsiniz.'
              : 'Canlı kamera görüntüsü analiz ediliyor. Çardakta şu anda kişi tespit edildi. Alan kullanımda görünüyor. Çardak boşalana kadar rezervasyon işlemi beklemeye alınmıştır.'}
          </Text>
        </View>

        {isEmpty && (
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.reserveButtonText}>Rezervasyon Yap</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Rezervasyon Formu</Text>

            <Text style={styles.fieldLabel}>Başlangıç</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => openPicker('start')}
            >
              <Text style={styles.pickerButtonText}>Başlangıç Tarih / Saat Seç</Text>
            </TouchableOpacity>
            <Text style={styles.selectedText}>{formatDateTime(startTime)}</Text>

            <Text style={styles.fieldLabel}>Bitiş</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => openPicker('end')}
            >
              <Text style={styles.pickerButtonText}>Bitiş Tarih / Saat Seç</Text>
            </TouchableOpacity>
            <Text style={styles.selectedText}>{formatDateTime(endTime)}</Text>

            <View style={styles.durationBox}>
              <Ionicons name="time-outline" size={20} color="#047857" />
              <Text style={styles.durationText}>{getReservationDuration()}</Text>
            </View>

            <WeatherCard
              variant="reservation"
              loading={reservationWeatherLoading}
              error={getParkCoords(park) ? null : 'no_coords'}
              forecast={reservationWeather?.forecast}
            />

            <Text style={styles.fieldLabel}>Ödeme ({reservationFee} ₺)</Text>
            {paymentMethods.length === 0 ? (
              <Text style={styles.paymentHint}>
                Kayıtlı kart yok. Profil → Ödeme Yöntemleri bölümünden kart ekleyin.
              </Text>
            ) : (
              paymentMethods.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.paymentOption,
                    selectedPaymentId === m.id && styles.paymentOptionActive,
                  ]}
                  onPress={() => setSelectedPaymentId(m.id)}
                >
                  <Text style={styles.paymentOptionText}>
                    {m.cardBrand} •••• {m.cardLastFour} {m.isDefault ? '(Varsayılan)' : ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {showPicker && (
              <DateTimePicker
                value={pickerType === 'start' ? startTime : endTime}
                mode={pickerMode}
                is24Hour={true}
                display="default"
                onChange={onPickerChange}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, submitting && { opacity: 0.7 }]}
                onPress={handleConfirmReservation}
                disabled={submitting}
              >
                <Text style={styles.modalBtnText}>
                  {submitting ? 'İşleniyor...' : `Rezervasyonu Onayla (${reservationFee} ₺)`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  header: {
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 3,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#064e3b',
  },
  content: {
    padding: 18,
  },
  parkName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#065f46',
  },
  cottageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
    marginTop: 4,
    marginBottom: 18,
  },
  cameraBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#111827',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 5,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  statusBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  fullBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  emptyBox: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#064e3b',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
  },
  reserveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 24,
    elevation: 6,
  },
  reserveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065f46',
    marginTop: 10,
    marginBottom: 6,
  },
  pickerButton: {
    backgroundColor: '#124d57',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  selectedText: {
    fontSize: 13,
    color: '#334155',
    marginTop: 8,
  },
  durationBox: {
    marginTop: 14,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  durationText: {
    marginLeft: 8,
    color: '#065f46',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  paymentHint: {
    fontSize: 13,
    color: '#b45309',
    marginBottom: 8,
    lineHeight: 20,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f0fdf4',
  },
  paymentOptionActive: {
    borderColor: '#059669',
    backgroundColor: '#d1fae5',
  },
  paymentOptionText: {
    color: '#065f46',
    fontWeight: '700',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  modalBtn: {
    width: '48%',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: '#10b981',
  },
  cancelBtn: {
    backgroundColor: '#ef4444',
  },
  modalBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
});