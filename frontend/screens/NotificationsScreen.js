import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getApiBaseUrl } from '../config/api';
import { useUser } from '../context/UserContext';
import ScreenHeader from '../components/ScreenHeader';
import { theme } from '../theme/colors';
import { formatTurkeyDateTime } from '../utils/dateTime';

const TYPE_META = {
  reservation: { icon: 'calendar', color: theme.primary },
  upcoming: { icon: 'alarm', color: theme.primaryDark },
  event: { icon: 'megaphone', color: theme.warning },
  system: { icon: 'information-circle', color: theme.subtitle },
};

export default function NotificationsScreen({ navigation }) {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const userId = user?.id;
      const url = userId
        ? `${baseUrl}/api/notifications?userId=${userId}`
        : `${baseUrl}/api/notifications`;
      const response = await fetch(url);
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [user?.id])
  );

  const markRead = async (id) => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/notifications/${id}/read`, { method: 'PATCH' });
      setItems((prev) =>
        prev.map((n) =>
          String(n.id) === String(id) ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Okundu işaretlenemedi:', error);
    }
  };

  const renderItem = ({ item }) => {
    const meta = TYPE_META[item.type] || TYPE_META.system;
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
          <Ionicons name={meta.icon} size={22} color={meta.color} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMessage}>{item.message}</Text>
          <Text style={styles.cardTime}>
            {formatTurkeyDateTime(item.createdAt)}
          </Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScreenHeader
        title="Bildirimler"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={styles.loader}
        />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={56} color={theme.textMuted} />
          <Text style={styles.emptyTitle}>Bildirim yok</Text>
          <Text style={styles.emptyText}>
            Rezervasyon veya etkinlik yaptığınızda burada görünecek.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              colors={[theme.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loader: {
    marginTop: 48,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardUnread: {
    borderColor: theme.primary,
    backgroundColor: '#F1FDFB',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.title,
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  cardTime: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.title,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
