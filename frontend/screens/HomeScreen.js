import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/colors';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: '1', title: 'Parkları Keşfet', icon: '🌳', route: 'Cities' },
  { id: '2', title: 'Rezervasyonlarım', icon: '📝', route: 'ReservationScreen' },
  { id: '3', title: 'Etkinlikler', icon: '🎉', route: 'Events' },
  { id: '4', title: 'Kayıp/Bulunan', icon: '🔍', route: 'LostFound' },
  { id: '5', title: 'Bildirimler', icon: '🔔', route: 'Notifications' },
  { id: '6', title: 'Profilim', icon: '👤', route: 'Profile' },
];

export default function HomeScreen({ route, navigation }) {
  const { user: contextUser } = useUser();
  const { isDark } = useTheme();
  const user = route?.params?.user || contextUser;

  // Tema Renkleri
  const bg = isDark ? '#0f172a' : theme.background;
  const cardBg = isDark ? '#1e293b' : theme.card;
  const textColor = isDark ? '#10b981' : theme.title;
  const subTextColor = isDark ? '#94a3b8' : theme.subtitle;
  const borderColor = isDark ? '#334155' : theme.border;

  let displayName = 'Misafir';
  if (user?.full_name) {
    displayName = user.full_name.split(' ')[0];
  }

  const handleMenuPress = (item) => {
    if (item.route === 'Profile') {
      navigation.navigate('Profile', { user });
      return;
    }
    navigation.navigate(item.route);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerImageContainer}>
          <Image
            source={require('../assets/login-park.png')}
            style={styles.headerImage}
          />
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.title, { color: textColor }]}>Hoş geldin {displayName}!</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>Akıllı Piknik Alanı Yönetim Sistemi</Text>
        </View>

        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.75}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerImageContainer: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: theme.card,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.title,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.subtitle,
    fontWeight: '500',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: theme.card,
    width: (width - 56) / 2,
    height: 118,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.title,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
