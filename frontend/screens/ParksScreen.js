import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getDummyParks } from '../data/dummyParks.js';
import TurkishTextInput from '../components/TurkishTextInput';

// Haversine formülü ile iki koordinat arası mesafe (km)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
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

export default function ParksScreen({ navigation, route }) {
  const { city, district } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [parks, setParks] = useState([]);
  const [filteredParks, setFilteredParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Kullanıcı konumunu al
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Konum izni verilmedi. Mesafe bilgisi gösterilemiyor.');
        } else {
          // Konumu Gümüşhane olarak sabitledik (Kullanıcı İsteği)
          setUserLocation({
            latitude: 40.4608,
            longitude: 39.4803,
          });
          console.log('Kullanıcı konumu (Gümüşhane sabit):', 40.4608, 39.4803);
        }
      } catch (error) {
        console.error('Konum alınamadı:', error);
      }
    })();
  }, []);

  useEffect(() => {
    // Şehir/ilçeye göre dummy veriyi yükle
    const timer = setTimeout(() => {
      const data = getDummyParks(city, district).map((p) => ({
        ...p,
        latitude: p.lat,
        longitude: p.lon,
      }));
      setParks(data);
      setFilteredParks(data);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [city, district]);

  useEffect(() => {
    const text = searchText.trim().toLocaleLowerCase('tr-TR');
    const filtered = parks.filter((park) =>
      park.name.toLocaleLowerCase('tr-TR').includes(text)
    );
    setFilteredParks(filtered);
  }, [searchText, parks]);

  // Boş slot durumuna göre renk belirleme
  const getSlotColor = (emptySlots) => {
    if (emptySlots === 0) return '#ef4444';
    if (emptySlots <= 10) return '#f59e0b';
    return '#10b981';
  };

  const getSlotLabel = (emptySlots) => {
    if (emptySlots === 0) return 'Dolu';
    if (emptySlots <= 10) return 'Az Yer';
    return 'Müsait';
  };

  const renderParkCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => {
        console.log('Tıklanan Park ID:', item.id);
        // navigation.navigate('ParkDetail', { park: item });
      }}
    >
      {/* Üst renk bandı - doluluk durumuna göre */}
      <View style={[styles.cardTopBand, { backgroundColor: getSlotColor(item.emptySlots) }]} />

      <ImageBackground 
        source={{ uri: item.image || getFallbackImage(item.id) }}
        style={styles.cardImageBg}
        imageStyle={styles.cardImageStyle}
      >
        <View style={styles.cardBodyOverlay}>
          {/* Park adı ve ikonu */}
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🅿️</Text>
            </View>
            <View style={styles.cardTitleArea}>
              <Text style={styles.parkName}>{item.name}</Text>
              <View style={styles.parkSubRow}>
                <Text style={styles.parkId}>ID: {item.id}</Text>
                {userLocation && (
                  <Text style={styles.distanceText}>
                    📍 {getDistance(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude)} km
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Boş slot bilgisi */}
          <View style={styles.slotRow}>
            <View style={styles.slotInfo}>
              <Text style={styles.slotNumber}>{item.emptySlots}</Text>
              <Text style={styles.slotLabel}>Boş Yer</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: getSlotColor(item.emptySlots) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getSlotColor(item.emptySlots) }]} />
              <Text style={[styles.statusText, { color: getSlotColor(item.emptySlots) }]}>
                {getSlotLabel(item.emptySlots)}
              </Text>
            </View>
          </View>

          {/* Buton satırı */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.detailButton,
                item.emptySlots === 0 && styles.detailButtonDisabled,
              ]}
              onPress={() => {
                console.log('Detay - Park ID:', item.id);
              }}
              disabled={item.emptySlots === 0}
            >
              <Text style={styles.buttonText}>
                {item.emptySlots === 0 ? 'Park Dolu' : 'Detayı Gör →'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => {
                const origin = userLocation
                  ? `&origin=${userLocation.latitude},${userLocation.longitude}`
                  : '';
                const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${item.latitude},${item.longitude}`;
                Linking.openURL(url);
              }}
            >
              <Text style={styles.directionsButtonText}>📍 Yol Tarifi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0f5c69" />
        <Text style={{ marginTop: 12, color: '#555' }}>Parklar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f5c69" />
        </TouchableOpacity>
        <Text style={styles.header}>🚗 Parkları Keşfet</Text>
      </View>
      <Text style={styles.subHeader}>
        Toplam {parks.length} park • {parks.reduce((a, p) => a + p.emptySlots, 0)} boş yer
      </Text>

      <TurkishTextInput
        variant="search"
        style={styles.searchInput}
        placeholder="Park adına göre ara..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredParks}
        keyExtractor={(item) => item.id}
        renderItem={renderParkCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aramanızla eşleşen park bulunamadı.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7f8',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7f8',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  header: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f5c69',
    textAlign: 'center',
    marginRight: 40, // back btn genişliği kadar kompanse etmek için
  },
  subHeader: {
    fontSize: 14,
    color: '#6b9aa2',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTopBand: {
    height: 4,
    width: '100%',
  },
  cardImageBg: {
    width: '100%',
  },
  cardImageStyle: {
    opacity: 0.15,
  },
  cardBodyOverlay: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  cardTitleArea: {
    flex: 1,
  },
  parkName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#124d57',
  },
  parkId: {
    fontSize: 12,
    color: '#8eadb4',
    marginTop: 2,
  },
  parkSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#f8fbfb',
    borderRadius: 12,
    padding: 12,
  },
  slotInfo: {
    alignItems: 'center',
  },
  slotNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f5c69',
  },
  slotLabel: {
    fontSize: 12,
    color: '#6b9aa2',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#0f5c69',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailButtonDisabled: {
    backgroundColor: '#ccc',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  directionsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
});