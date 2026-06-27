import React, { useState, useCallback, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { getApiBaseUrl } from '../config/api';
import { apiFetch } from '../utils/apiClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import TurkishTextInput from '../components/TurkishTextInput';
import StarRating from '../components/StarRating';
import WeatherCard from '../components/WeatherCard';
import {
  fetchParkReviews,
  submitParkReview,
  updateParkReview,
  deleteParkReview,
  ratingLabel,
} from '../utils/parkReviews';
import {
  fetchParkWeatherToday,
  fetchParkWeatherForDateTime,
  getParkCoords,
} from '../utils/weather';
import {
  formatTurkeyDateTime,
  getNowForPicker,
  addHours,
  mergeDateAndTime,
  validateReservationRange,
} from '../utils/dateTime';

export default function ParkDetailScreen({ route, navigation }) {
  const { park } = route.params;
  const { user } = useUser();
  const { isThemeDark, isDark } = useTheme();
  const themeDark = isDark || isThemeDark; // fallback handle
  const { isFavorite, toggleFavorite } = useFavorites();

  const [commentText, setCommentText] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, count: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editingRating, setEditingRating] = useState(0);
  const [editingText, setEditingText] = useState('');

  // Tema Renkleri
  const bg = themeDark ? '#0f172a' : '#ecfdf5';
  const cardBg = themeDark ? '#1e293b' : '#ffffff';
  const textPrimary = themeDark ? '#10b981' : '#065f46';
  const textSecondary = themeDark ? '#94a3b8' : '#334155';
  const inputBg = themeDark ? '#1e293b' : '#f8fafc';
  const inputBorder = themeDark ? '#334155' : '#e2e8f0';
  const modalBg = themeDark ? '#1e293b' : '#ffffff';

  const favorited = isFavorite(park);

  const loadReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const data = await fetchParkReviews(park);
      setReviews(data.reviews);
      setReviewStats(data.stats);
    } catch (error) {
      console.error('Değerlendirmeler yüklenemedi:', error);
      setReviews([]);
      setReviewStats({ averageRating: 0, count: 0 });
    } finally {
      setLoadingReviews(false);
    }
  }, [park]);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews])
  );

  const myReview = reviews.find((r) => r.userId === user?.id);

  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [startTime, setStartTime] = useState(() => getNowForPicker());
  const [endTime, setEndTime] = useState(() => addHours(getNowForPicker(), 1));

  const [showPicker, setShowPicker] = useState(false);
  const [pickerField, setPickerField] = useState('start');
  const [pickerStep, setPickerStep] = useState('date');
  const [pickerDraft, setPickerDraft] = useState(() => getNowForPicker());

  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [todayWeather, setTodayWeather] = useState(null);
  const [reservationWeather, setReservationWeather] = useState(null);
  const [reservationWeatherLoading, setReservationWeatherLoading] = useState(false);

  const loadTodayWeather = useCallback(async () => {
    if (!getParkCoords(park)) {
      setWeatherError('no_coords');
      setWeatherLoading(false);
      return;
    }
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const data = await fetchParkWeatherToday(park);
      setTodayWeather(data);
    } catch (error) {
      setWeatherError(error.message || 'Hava durumu alınamadı.');
      setTodayWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }, [park]);

  const loadReservationWeather = useCallback(async () => {
    if (!modalVisible || !getParkCoords(park)) {
      setReservationWeather(null);
      return;
    }
    try {
      setReservationWeatherLoading(true);
      const data = await fetchParkWeatherForDateTime(park, startTime);
      setReservationWeather(data);
    } catch (error) {
      setReservationWeather(null);
    } finally {
      setReservationWeatherLoading(false);
    }
  }, [park, startTime, modalVisible]);

  useFocusEffect(
    useCallback(() => {
      loadTodayWeather();
    }, [loadTodayWeather])
  );

  useEffect(() => {
    loadReservationWeather();
  }, [loadReservationWeather]);

  const openReservationModal = useCallback(() => {
    const now = getNowForPicker();
    setStartTime(now);
    setEndTime(addHours(now, 1));
    setShowPicker(false);
    setPickerStep('date');
    setModalVisible(true);
  }, []);

  const openPicker = (field) => {
    const base = field === 'start' ? startTime : endTime;
    setPickerField(field);
    setPickerStep('date');
    setPickerDraft(base);
    setShowPicker(true);
  };

  const onPickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android' && event?.type === 'dismissed') {
      setShowPicker(false);
      setPickerStep('date');
      return;
    }

    const current = selectedDate || pickerDraft;

    if (pickerStep === 'date') {
      const base = pickerField === 'start' ? startTime : endTime;
      const withDate = mergeDateAndTime(current, base);
      setPickerDraft(withDate);
      setPickerStep('time');
      if (Platform.OS === 'android') {
        setShowPicker(true);
      }
      return;
    }

    const finalDate = mergeDateAndTime(pickerDraft, current);

    if (pickerField === 'start') {
      setStartTime(finalDate);
      if (endTime.getTime() <= finalDate.getTime()) {
        setEndTime(addHours(finalDate, 1));
      }
    } else {
      setEndTime(finalDate);
    }

    setShowPicker(false);
    setPickerStep('date');
  };

  const handleReservation = async () => {
    const validationError = validateReservationRange(startTime, endTime);
    if (validationError) {
      Alert.alert('Geçersiz tarih veya saat', validationError);
      return;
    }

    if (!user?.id) {
      Alert.alert('Giriş gerekli', 'Rezervasyon için lütfen giriş yapın.');
      return;
    }

    setSubmitting(true);

    try {
      const { response, data } = await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          PicnicAreaId: park.id || park.Id || 1,
          ParkName: park.name || 'Park adı yok',
          StartTime: startTime.toISOString(),
          EndTime: endTime.toISOString(),
          Status: 'Onaylandı',
          SkipPayment: true,
        }),
      });

      if (response.ok && data.success !== false) {
        setModalVisible(false);
        navigation.navigate('ReservationScreen');
        return;
      }

      Alert.alert(
        'Geçersiz tarih veya saat',
        data.message || 'Rezervasyon kaydedilemedi. Lütfen tarih ve saatleri kontrol edin.'
      );
    } catch (error) {
      console.error('Bağlantı Hatası Detayı:', error);
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const pickerMinimumDate =
    pickerField === 'end' ? startTime : getNowForPicker();

  const handleSubmitReview = async () => {
    if (!user?.id) {
      Alert.alert('Giriş gerekli', 'Değerlendirme yapmak için lütfen giriş yapın.');
      return;
    }
    if (newRating < 1) {
      Alert.alert('Uyarı', 'Lütfen 1–5 arası yıldız puanı verin.');
      return;
    }

    setSubmittingReview(true);
    try {
      await submitParkReview({
        park,
        rating: newRating,
        text: commentText,
      });
      if (!favorited) {
        await toggleFavorite(park);
      }
      setCommentText('');
      setNewRating(0);
      await loadReviews();
      Alert.alert('Teşekkürler', 'Değerlendirmeniz kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', error.message || 'Değerlendirme kaydedilemedi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert('Sil', 'Bu değerlendirmeyi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParkReview({ reviewId });
            await loadReviews();
          } catch (error) {
            Alert.alert('Hata', error.message || 'Silinemedi.');
          }
        },
      },
    ]);
  };

  const handleStartEditReview = (review) => {
    setEditingReview(review);
    setEditingRating(review.rating);
    setEditingText(review.text || '');
  };

  const handleSaveEditReview = async () => {
    if (editingRating < 1) {
      Alert.alert('Uyarı', 'Lütfen 1–5 arası yıldız puanı verin.');
      return;
    }
    try {
      await updateParkReview({
        reviewId: editingReview.id,
        rating: editingRating,
        text: editingText,
      });
      setEditingReview(null);
      await loadReviews();
    } catch (error) {
      Alert.alert('Hata', error.message || 'Güncellenemedi.');
    }
  };

  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498453472714-23eb46b38466?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605141571477-9430c00d41e2?q=80&w=2070&auto=format&fit=crop'
  ];

  const getFallbackImage = (identifier) => {
    const str = String(identifier || 'park');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} bounces={false}>
      <Image 
        source={{ uri: park.image && park.image.trim() !== '' ? park.image : getFallbackImage(park.id || park.name) }} 
        style={styles.image} 
      />

      {/* Yüzen Geri Butonu */}
      <TouchableOpacity 
        style={styles.floatingBackBtn} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={[styles.content, { backgroundColor: bg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textPrimary }]}>{park.name}</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={async () => {
                const result = await toggleFavorite(park);
                if (result && !result.ok) {
                  Alert.alert('Favoriler', result.message || 'İşlem yapılamadı.');
                }
              }}
              hitSlop={12}
              style={styles.favBtn}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={28}
                color={favorited ? '#E53935' : '#64748b'}
              />
            </TouchableOpacity>
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
        </View>

        <Text style={[styles.location, { color: textPrimary }]}>📍 {park.location}</Text>

        <WeatherCard
          variant="detail"
          loading={weatherLoading}
          error={weatherError}
          current={todayWeather?.current}
          daily={todayWeather?.daily}
          themeDark={themeDark}
        />

        <View style={styles.infoGrid}>
          <View style={[styles.infoItem, { backgroundColor: cardBg, borderColor: themeDark ? '#475569' : '#34d399', borderWidth: themeDark ? 1 : 0 }]}>
            <Text style={styles.infoLabel}>Uzaklık</Text>
            <Text style={[styles.infoValue, { color: textPrimary }]}>
              {park.distance ? `${park.distance} km` : 'Bilinmiyor'}
            </Text>
          </View>

          <View style={[styles.infoItem, { backgroundColor: cardBg, borderColor: themeDark ? '#475569' : '#34d399', borderWidth: themeDark ? 1 : 0 }]}>
            <Text style={styles.infoLabel}>Boyut</Text>
            <Text style={[styles.infoValue, { color: textPrimary }]}>
              {typeof park.size_sqm === 'number'
                ? `${park.size_sqm} m²`
                : 'Bilinmiyor'}
            </Text>
          </View>

          <View style={[styles.infoItem, { backgroundColor: cardBg, borderColor: themeDark ? '#475569' : '#34d399', borderWidth: themeDark ? 1 : 0 }]}>
            <Text style={styles.infoLabel}>Kapasite</Text>
            <Text style={[styles.infoValue, { color: textPrimary }]}>
              {typeof park.capacity === 'number'
                ? `${park.capacity} Kişi`
                : 'Bilinmiyor'}
            </Text>
          </View>

          <View style={[styles.infoItem, { backgroundColor: cardBg, borderColor: themeDark ? '#475569' : '#34d399', borderWidth: themeDark ? 1 : 0 }]}>
            <Text style={styles.infoLabel}>Doluluk</Text>
            <Text style={[styles.infoValue, { color: textPrimary }]}>
              {typeof park.occupancyRate === 'number'
                ? `%${park.occupancyRate}`
                : 'Bilinmiyor'}
            </Text>
          </View>
        </View>



        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Değerlendirmeler</Text>

        <View style={[styles.reviewSummaryCard, { backgroundColor: cardBg, borderColor: themeDark ? '#334155' : '#a7f3d0' }]}>
          {loadingReviews ? (
            <ActivityIndicator color="#10b981" />
          ) : reviewStats.count > 0 ? (
            <>
              <Text style={[styles.reviewAvg, { color: textPrimary }]}>
                {reviewStats.averageRating.toFixed(1)}
              </Text>
              <StarRating value={reviewStats.averageRating} size="md" />
              <Text style={[styles.reviewCount, { color: textSecondary }]}>
                {reviewStats.count} değerlendirme
              </Text>
            </>
          ) : (
            <Text style={[styles.noComments, { color: textSecondary, marginBottom: 0 }]}>
              Henüz değerlendirme yok. İlk puanı siz verin.
            </Text>
          )}
        </View>

        {!myReview && user?.id && (
          <View style={[styles.reviewFormCard, { backgroundColor: cardBg, borderColor: themeDark ? '#334155' : '#d1fae5' }]}>
            <Text style={[styles.reviewFormLabel, { color: textPrimary }]}>Puanınız</Text>
            <StarRating value={newRating} interactive onChange={setNewRating} size="lg" />
            {newRating > 0 && (
              <Text style={[styles.ratingHint, { color: textSecondary }]}>
                {ratingLabel(newRating)}
              </Text>
            )}
            <TurkishTextInput
              variant="multiline"
              style={[styles.commentInput, styles.reviewTextInput, { backgroundColor: inputBg, borderColor: inputBorder, color: textSecondary }]}
              placeholder="Deneyiminizi paylaşın (isteğe bağlı)..."
              placeholderTextColor="#94a3b8"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.reviewSubmitBtn, submittingReview && styles.btnDisabled]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.reviewSubmitText}>Değerlendirmeyi Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!user?.id && (
          <View style={[styles.myReviewBanner, { backgroundColor: themeDark ? '#1e293b' : '#f1f5f9' }]}>
            <Ionicons name="log-in-outline" size={18} color="#64748b" />
            <Text style={[styles.myReviewBannerText, { color: textSecondary }]}>
              Değerlendirme yapmak ve puan vermek için giriş yapın.
            </Text>
          </View>
        )}

        {myReview && (
          <View style={[styles.myReviewBanner, { backgroundColor: themeDark ? '#064e3b' : '#ecfdf5' }]}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={[styles.myReviewBannerText, { color: textPrimary }]}>
              Bu park için değerlendirmeniz kayıtlı. Aşağıdan düzenleyebilirsiniz.
            </Text>
          </View>
        )}

        {reviews.length === 0 && !loadingReviews ? null : (
          reviews.map((c) => (
            <View key={c.id} style={[styles.commentCard, { backgroundColor: cardBg, borderColor: themeDark ? '#334155' : 'transparent', borderWidth: themeDark ? 1 : 0 }]}>
              <View style={styles.commentHeader}>
                <View style={styles.reviewAuthorBlock}>
                  <Text style={styles.commentAuthor}>{c.userName}</Text>
                  <StarRating value={c.rating} size="sm" />
                </View>
                {user?.id === c.userId && (
                  <View style={styles.commentActions}>
                    <TouchableOpacity onPress={() => handleStartEditReview(c)} style={styles.actionBtn}>
                      <Ionicons name="pencil" size={16} color="#059669" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteReview(c.id)} style={styles.actionBtn}>
                      <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {editingReview?.id === c.id ? (
                <View style={styles.editCommentContainer}>
                  <StarRating value={editingRating} interactive onChange={setEditingRating} size="md" />
                  <TurkishTextInput
                    variant="multiline"
                    style={[styles.editCommentInput, { backgroundColor: inputBg, color: textSecondary, borderColor: themeDark ? '#475569' : '#34d399' }]}
                    value={editingText}
                    onChangeText={setEditingText}
                    multiline
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.editBtnSave} onPress={handleSaveEditReview}>
                      <Text style={styles.editBtnText}>Kaydet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editBtnCancel} onPress={() => setEditingReview(null)}>
                      <Text style={styles.editBtnText}>İptal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {c.text ? (
                    <Text style={[styles.commentBody, { color: textSecondary }]}>{c.text}</Text>
                  ) : null}
                  <Text style={[styles.commentDate, { color: themeDark ? '#64748b' : '#94a3b8' }]}>
                    {formatTurkeyDateTime(c.createdAt)}
                    {c.updatedAt ? ' (Güncellendi)' : ''}
                    {c.sourceType === 'reservation' ? ' · Rezervasyon sonrası' : ''}
                  </Text>
                </>
              )}
            </View>
          ))
        )}

        <TouchableOpacity
  style={styles.reserveButton}
  onPress={() => navigation.navigate('CottageSelectionScreen', { park })}
>
  <Text style={styles.reserveButtonText}>Çardak Seç</Text>
</TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: modalBg }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Rezervasyon Formu</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: textPrimary }]}>Başlangıç</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openPicker('start')}
              >
                <Text style={styles.pickerButtonText}>Başlangıç Tarih / Saat Seç</Text>
              </TouchableOpacity>
              <Text style={[styles.selectedText, { color: textSecondary }]}>
                {formatTurkeyDateTime(startTime)}
              </Text>

              <Text style={[styles.fieldLabel, styles.fieldLabelSpaced, { color: textPrimary }]}>Bitiş</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openPicker('end')}
              >
                <Text style={styles.pickerButtonText}>Bitiş Tarih / Saat Seç</Text>
              </TouchableOpacity>
              <Text style={[styles.selectedText, { color: textSecondary }]}>
                {formatTurkeyDateTime(endTime)}
              </Text>
            </View>

            <WeatherCard
              variant="reservation"
              loading={reservationWeatherLoading}
              error={getParkCoords(park) ? null : 'no_coords'}
              forecast={reservationWeather?.forecast}
              themeDark={themeDark}
            />

            {showPicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={pickerDraft}
                mode={pickerStep}
                is24Hour={true}
                display="default"
                onChange={onPickerChange}
                minimumDate={pickerMinimumDate}
              />
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.btn, styles.btnConfirm, submitting && styles.btnDisabled]}
                onPress={handleReservation}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Rezervasyon Onayla</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
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
    backgroundColor: '#ecfdf5', // Açık nane yeşili
  },
  image: {
    width: '100%',
    height: 280,
  },
  floatingBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    padding: 24,
    backgroundColor: '#ecfdf5',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favBtn: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#065f46',
    flex: 1,
    marginRight: 8,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  reviewSummaryCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  reviewAvg: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },
  reviewFormCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  reviewFormLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  ratingHint: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  reviewTextInput: {
    marginTop: 12,
    width: '100%',
    maxHeight: 120,
  },
  reviewSubmitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  reviewSubmitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  myReviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  myReviewBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewAuthorBlock: {
    flex: 1,
    gap: 4,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#f8fafc',
    color: '#334155',
  },
  commentSendBtn: {
    marginLeft: 8,
    backgroundColor: '#124d57',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noComments: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  commentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b', // Turuncu bir renk patlaması
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    marginLeft: 12,
    padding: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b45309', // Koyu turuncu
    flex: 1,
  },
  commentBody: {
    fontSize: 14,
    color: '#334155',
    marginTop: 6,
    lineHeight: 22,
  },
  commentDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
    fontWeight: '600',
  },
  editCommentContainer: {
    marginTop: 8,
  },
  editCommentInput: {
    borderWidth: 1,
    borderColor: '#34d399',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#ecfdf5',
    minHeight: 60,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editBtnSave: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  editBtnCancel: {
    backgroundColor: '#94a3b8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    color: '#047857',
    fontWeight: '600',
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  infoItem: {
    width: '48%',
    padding: 16,
    marginVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderColor: '#34d399',
  },
  infoLabel: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '800',
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#064e3b',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#047857',
    marginBottom: 12,
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 24,
    fontWeight: '500',
  },
  reserveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
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
    padding: 28,
    alignItems: 'center',
    width: '92%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#124d57',
    marginBottom: 12,
  },
  formGroup: {
    width: '100%',
    marginVertical: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#124d57',
    marginBottom: 6,
  },
  fieldLabelSpaced: {
    marginTop: 14,
  },
  pickerButton: {
    backgroundColor: '#124d57',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectedText: {
    fontSize: 13,
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnConfirm: {
    backgroundColor: '#10b981',
  },
  btnCancel: {
    backgroundColor: '#ef4444',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
