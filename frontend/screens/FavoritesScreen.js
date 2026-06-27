import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import ExploreBottomNav from '../components/ExploreBottomNav';
import StarRating from '../components/StarRating';
import { fetchParkReviews } from '../utils/parkReviews';
import { getParkKey } from '../utils/parkKey';
import { formatTurkeyDateTime } from '../utils/dateTime';

const GREEN = '#1B4332';

export default function FavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { getFavoriteParks, refreshFavorites, ready } = useFavorites();
  const { isDark } = useTheme();
  const parks = getFavoriteParks();
  const [reviewsByPark, setReviewsByPark] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const bottomPad = Math.max(insets.bottom, 12) + 72;

  const loadReviews = useCallback(async () => {
    if (!parks.length) {
      setReviewsByPark({});
      return;
    }
    setLoadingReviews(true);
    try {
      const entries = await Promise.all(
        parks.map(async (park) => {
          try {
            const data = await fetchParkReviews(park);
            return [getParkKey(park), data.reviews];
          } catch {
            return [getParkKey(park), []];
          }
        })
      );
      setReviewsByPark(Object.fromEntries(entries));
    } finally {
      setLoadingReviews(false);
    }
  }, [parks]);

  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites])
  );

  useFocusEffect(
    useCallback(() => {
      if (ready) loadReviews();
    }, [ready, loadReviews])
  );

  const bg = isDark ? '#0f172a' : '#e6f7f5';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const cardBorderColor = isDark ? '#334155' : '#ECEEEA';
  const textPrimary = isDark ? '#10b981' : GREEN;
  const textSecondary = isDark ? '#94a3b8' : '#6B7280';
  const commentsBg = isDark ? '#0f172a' : '#FAFBFA';
  const commentBorderColor = isDark ? '#334155' : '#F0F0F0';

  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498453472714-23eb46b38466?q=80&w=2070&auto=format&fit=crop',
  ];

  const getFallbackImage = (identifier) => {
    const str = String(identifier || 'park');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.brand, { color: textPrimary }]}>Favorilerim</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {!ready ? (
          <ActivityIndicator color={textPrimary} style={{ marginTop: 40 }} />
        ) : parks.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color="#9CA3AF" />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>Henüz favori park yok</Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Park detayında kalp ikonuna basarak favorilere ekleyebilir veya değerlendirme yapabilirsiniz.
            </Text>
            <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Cities')}>
              <Text style={styles.ctaText}>Parkları Keşfet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          parks.map((park) => {
            const key = getParkKey(park);
            const reviews = reviewsByPark[key] || [];
            return (
              <View
                key={key}
                style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorderColor, borderWidth: isDark ? 1 : 0 }]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('ParkDetail', { park })}
                >
                  <Image
                    source={{
                      uri:
                        park.image && park.image.trim() !== ''
                          ? park.image
                          : getFallbackImage(park.id || park.name),
                    }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>{park.name}</Text>
                    {park.location ? (
                      <Text style={[styles.cardLocation, { color: textSecondary }]}>
                        📍 {park.location}
                      </Text>
                    ) : null}
                    <View style={styles.favBadge}>
                      <Ionicons name="heart" size={14} color="#E53935" />
                      <Text style={styles.favBadgeText}>Favorilerimde</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={[styles.commentsBlock, { backgroundColor: commentsBg, borderTopColor: commentBorderColor }]}>
                  <Text style={[styles.commentsTitle, { color: textPrimary }]}>
                    Değerlendirmeler ({reviews.length})
                  </Text>
                  {loadingReviews && reviews.length === 0 ? (
                    <ActivityIndicator size="small" color={textPrimary} />
                  ) : reviews.length === 0 ? (
                    <Text style={[styles.noComment, { color: textSecondary }]}>
                      Bu park için henüz değerlendirme yok.
                    </Text>
                  ) : (
                    reviews.slice(0, 3).map((r) => (
                      <View key={r.id} style={styles.reviewRow}>
                        <View style={styles.reviewHeader}>
                          <Text style={[styles.commentAuthor, { color: textPrimary }]}>{r.userName}</Text>
                          <StarRating value={r.rating} size="sm" />
                        </View>
                        {r.text ? (
                          <Text style={[styles.commentText, { color: isDark ? '#e2e8f0' : '#374151' }]}>
                            {r.text}
                          </Text>
                        ) : null}
                        <Text style={[styles.commentTime, { color: textSecondary }]}>
                          {formatTurkeyDateTime(r.createdAt)}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <ExploreBottomNav navigation={navigation} activeTab="favorites" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brand: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 10 },
  cta: {
    marginTop: 24,
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    }),
  },
  cardImage: { width: '100%', height: 140, backgroundColor: '#E8F5E9' },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardLocation: { fontSize: 13, marginTop: 4 },
  favBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  favBadgeText: { marginLeft: 6, fontSize: 12, color: '#E53935', fontWeight: '600' },
  commentsBlock: { borderTopWidth: 1, padding: 14 },
  commentsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  noComment: { fontSize: 13, fontStyle: 'italic' },
  reviewRow: { marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor: { fontSize: 13, fontWeight: '700', flex: 1 },
  commentText: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  commentTime: { fontSize: 11, marginTop: 4 },
  navWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
