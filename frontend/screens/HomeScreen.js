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
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

// 1. Route ismini 'ReservationScreen' olarak güncelledik
const menuItems = [
  { id: '1', title: 'Parkları Keşfet', icon: '🌳', route: 'Cities' },
  { id: '2', title: 'Rezervasyonlarım', icon: '📝', route: 'ReservationScreen' },
  { id: '3', title: 'Etkinlikler', icon: '🎉', route: 'Events' },
  { id: '4', title: 'Kayıp/Bulunan', icon: '🔍', route: 'LostFound' },
  { id: '5', title: 'Bildirimler', icon: '🔔', route: 'Notifications' },
  { id: '6', title: 'Profilim', icon: '👤', route: 'Profile' },
];

export default function HomeScreen({ route, navigation }) {
  const user = route?.params?.user;

  let displayName = 'Furkan'; // Profil ismine göre güncellenebilir
  if (user?.full_name) {
    displayName = user.full_name.split(' ')[0];
  }

  // 2. Yönlendirme mantığını güncelledik
  const handleMenuPress = (item) => {
    if (item.route === 'Cities') {
      navigation.navigate('Cities');
      return;
    }

    if (item.route === 'Profile') {
      navigation.navigate('Profile', { user });
      return;
    }

    // Rezervasyonlarım ekranına gitmesi için eklenen koşul
    if (item.route === 'ReservationScreen') {
      navigation.navigate('ReservationScreen');
      return;
    }

    Alert.alert(
      item.title,
      `${item.title} ekranı henüz eklenmedi.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerImageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            }}
            style={styles.headerImage}
          />
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Hoş geldin {displayName}!</Text>
          <Text style={styles.subtitle}>Park Yönetim Uygulaması</Text>
        </View>

        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
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
    backgroundColor: '#e6f7f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerImageContainer: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0d7d71',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#2b9c8f',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#135c5c',
    textAlign: 'center',
  },
});