import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getApiBaseUrl } from '../config/api';

const GREEN = '#1B4332';
const GREEN_MID = '#2D6A4F';
const RED_LIGHT = '#FEE2E2';
const RED = '#DC2626';

const MENU_ITEMS = [
  {
    id: 'personal',
    title: 'Kişisel Bilgiler',
    icon: 'person',
    iconBg: '#E8F5E9',
    iconColor: GREEN_MID,
  },
  {
    id: 'notifications',
    title: 'Bildirim Ayarları',
    icon: 'notifications',
    iconBg: '#FFF8E1',
    iconColor: '#F59E0B',
  },
  {
    id: 'payment',
    title: 'Ödeme Yöntemleri',
    icon: 'card',
    iconBg: '#E3F2FD',
    iconColor: '#2196F3',
  },
  {
    id: 'help',
    title: 'Yardım Merkezi',
    icon: 'help-circle',
    iconBg: '#F3E5F5',
    iconColor: '#9C27B0',
  },
  {
    id: 'privacy',
    title: 'Gizlilik ve Güvenlik',
    icon: 'shield-checkmark',
    iconBg: '#E8F5E9',
    iconColor: GREEN_MID,
  },
];

export default function ProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user, clearUser } = useUser();
  const { isDark } = useTheme();
  const { getFavoriteWithComments } = useFavorites();

  const displayName = user?.full_name || 'Kullanıcı';
  const displayEmail = user?.email || 'kullanici@example.com';

  const [reservationCount, setReservationCount] = useState(0);
  const favoriteCount = getFavoriteWithComments().length;

  useFocusEffect(
    useCallback(() => {
      const fetchReservations = async () => {
        try {
          const baseUrl = getApiBaseUrl();
          const userId = user?.id;
          if (!userId) return;

          const url = `${baseUrl}/api/reservations?userId=${userId}`;
          const response = await fetch(url);
          const data = await response.json();
          if (Array.isArray(data)) {
            setReservationCount(data.length);
          }
        } catch (error) {
          console.error('Rezervasyon sayısı çekilemedi:', error);
        }
      };

      fetchReservations();
    }, [user?.id])
  );

  // Tema renkleri
  const bg = isDark ? '#0f172a' : '#e6f7f5';
  const cardBg = isDark ? '#1e293b' : '#FFFFFF';
  const greenLight = isDark ? '#334155' : '#d8f3dc';
  const textPrimary = isDark ? '#10b981' : GREEN;
  const textSecondary = isDark ? '#94a3b8' : GREEN_MID;
  const borderColor = isDark ? '#475569' : '#E5E7EB';
  const menuText = isDark ? '#e2e8f0' : '#374151';

  const handleMenuPress = (item) => {
    switch (item.id) {
      case 'personal':
        navigation.navigate('PersonalInfo');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'payment':
        navigation.navigate('PaymentMethods');
        break;
      case 'help':
        navigation.navigate('HelpCenter');
        break;
      case 'privacy':
        navigation.navigate('PrivacySecurity');
        break;
      default:
        Alert.alert(item.title, `${item.title} ekranı yakında eklenecek.`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            clearUser();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      {/* ── Üst Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: textPrimary }]}>Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          hitSlop={12}
        >
          <Ionicons name="settings-outline" size={22} color={textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profil Kartı ── */}
        <View style={[styles.profileCard, { backgroundColor: greenLight }]}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri: 'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(displayName) +
                  '&background=d8f3dc&color=1B4332&size=128&bold=true&font-size=0.4',
              }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </View>
          <Text style={[styles.profileName, { color: textPrimary }]}>{displayName}</Text>
          <Text style={[styles.profileEmail, { color: textSecondary }]}>{displayEmail}</Text>
        </View>

        {/* ── İstatistikler ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="document-text" size={20} color="#1565C0" />
            </View>
            <Text style={[styles.statNumber, { color: textPrimary }]}>{reservationCount}</Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>Rezervasyon</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <View style={[styles.statIconWrap, { backgroundColor: RED_LIGHT }]}>
              <Ionicons name="heart" size={20} color={RED} />
            </View>
            <Text style={[styles.statNumber, { color: textPrimary }]}>{favoriteCount}</Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>Favori Parklar</Text>
          </View>
        </View>

        {/* ── Menü Listesi ── */}
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#334155' : item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color={isDark ? '#cbd5e1' : item.iconColor} />
              </View>
              <Text style={[styles.menuItemText, { color: menuText }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#64748b' : '#9CA3AF'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Çıkış Butonu ── */}
        <TouchableOpacity
          style={[styles.logoutBtn, isDark && { backgroundColor: '#450a0a' }]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={isDark ? '#f87171' : RED} />
          <Text style={[styles.logoutText, isDark && { color: '#f87171' }]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  /* ── Üst Bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GREEN,
  },

  scroll: {
    flex: 1,
  },

  /* ── Profil Kartı ── */
  profileCard: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: GREEN,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: GREEN_MID,
    fontWeight: '500',
  },

  /* ── İstatistikler ── */
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    gap: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: GREEN,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  /* ── Menü ── */
  menuCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  /* ── Çıkış ── */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: RED_LIGHT,
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: RED,
    marginLeft: 8,
  },
});
