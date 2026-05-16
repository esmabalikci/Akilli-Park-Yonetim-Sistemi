import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import ExploreBottomNav from '../components/ExploreBottomNav';
import { formatTurkeyDateTime } from '../utils/dateTime';

const BG = '#F9F9F8';
const GREEN = '#1B4332';
const GREEN_MUTED = '#2D6A4F';

export default function FavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { getFavoriteWithComments } = useFavorites();
  const { isDark } = useTheme();
  const items = getFavoriteWithComments();
  const bottomPad = Math.max(insets.bottom, 12) + 72;

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

  // Tema Renkleri
  const bg = isDark ? '#0f172a' : '#e6f7f5';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const cardBorderColor = isDark ? '#334155' : '#ECEEEA';
  const textPrimary = isDark ? '#10b981' : GREEN;
  const textSecondary = isDark ? '#94a3b8' : '#6B7280';
  const commentsBg = isDark ? '#0f172a' : '#FAFBFA';
  const commentBorderColor = isDark ? '#334155' : '#F0F0F0';
  const avatarBg = isDark ? '#334155' : '#E8F5E9';

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
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color="#9CA3AF" />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>Henüz favori park yok</Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Park detayında kalp ikonuna basarak favorilere ekleyebilir veya yorum
              yazabilirsiniz. Yorum yaptığınız parklar da burada görünür.
            </Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => navigation.navigate('Cities')}
            >
              <Text style={styles.ctaText}>Parkları Keşfet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map(({ park, comments }) => (
            <View key={String(park.id ?? park.name)} style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorderColor, borderWidth: isDark ? 1 : 0 }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ParkDetail', { park })}
              >
                <Image 
                  source={{ uri: park.image && park.image.trim() !== '' ? park.image : getFallbackImage(park.id || park.name) }} 
                  style={styles.cardImage} 
                />
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>{park.name}</Text>
                  {park.location ? (
                    <Text style={[styles.cardLocation, { color: textSecondary }]}>📍 {park.location}</Text>
                  ) : null}
                  <View style={styles.favBadge}>
                    <Ionicons name="heart" size={14} color="#E53935" />
                    <Text style={styles.favBadgeText}>Favorilerimde</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={[styles.commentsBlock, { backgroundColor: commentsBg, borderTopColor: commentBorderColor }]}>
                <Text style={[styles.commentsTitle, { color: textPrimary }]}>
                  Yorumlar ({comments.length})
                </Text>
                {comments.length === 0 ? (
                  <Text style={[styles.noComment, { color: textSecondary }]}>Bu park için henüz yorum yok.</Text>
                ) : (
                  comments.map((c) => (
                    <View key={c.id} style={styles.commentRow}>
                      <View style={[styles.commentAvatar, { backgroundColor: avatarBg }]}>
                        <Ionicons name="person" size={16} color={isDark ? '#cbd5e1' : GREEN} />
                      </View>
                      <View style={styles.commentContent}>
                        <Text style={[styles.commentAuthor, { color: textPrimary }]}>{c.userName}</Text>
                        <Text style={[styles.commentText, { color: isDark ? '#e2e8f0' : '#374151' }]}>{c.text}</Text>
                        <Text style={[styles.commentTime, { color: textSecondary }]}>
                          {formatTurkeyDateTime(c.createdAt)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <ExploreBottomNav navigation={navigation} activeTab="favorites" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: 0.5,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GREEN,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  cta: {
    marginTop: 24,
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEEEA',
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E8F5E9',
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 14 },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GREEN,
  },
  cardLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  favBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  favBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
  },
  commentsBlock: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 14,
    backgroundColor: '#FAFBFA',
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 10,
  },
  noComment: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentContent: { flex: 1 },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
