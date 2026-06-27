import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getDummyParks } from '../data/dummyParks.js';
import ExploreBottomNav from '../components/ExploreBottomNav';
import { useTheme } from '../context/ThemeContext';

/* ───────── RENK PALETİ ───────── */
const GREEN = '#1B4332';
const GREEN_MID = '#2D6A4F';
const GREEN_LIGHT = '#d8f3dc';
const GREEN_ACCENT = '#52B788';
const BROWN = '#6B4226';
const BROWN_LIGHT = '#D4A373';
const BG = '#F9F9F8';
const CARD_BG = '#FFFFFF';

const { width: SCREEN_W } = Dimensions.get('window');

/* ───────── DOĞA TEMALI HARİTA STİLİ ───────── */
const natureMapStyle = [
  // Genel arka plan - açık yeşil
  { elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  // Su alanları - açık mavi
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#b3e5fc' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5c8a97' }] },
  // Yollar
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#c5caa0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#b0b87c' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#d7dbc2' }] },
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#eef0e4' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5a6340' }] },
  // Parklar ve yeşil alanlar
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#a5d6a7' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#2e7d32' }] },
  // Diğer POI'ları gizle
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
  // Transit kapat
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  // Arazi
  { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ color: '#dcedc8' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{ color: '#e0e4cf' }] },
  // Etiketler
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#4e6e4e' }] },
  { featureType: 'administrative', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

/* ───────── YARDIMCI FONKSİYONLAR ───────── */
function toCoord(v) {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function normalizePark(raw) {
  const lat = toCoord(raw.lat ?? raw.latitude);
  const lon = toCoord(raw.lon ?? raw.longitude);
  return { ...raw, lat, lon };
}

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
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
  return R * c;
};

function crowdLabel(park) {
  if (typeof park.occupancyRate === 'number') {
    if (park.occupancyRate < 45) return 'Yoğun değil';
    if (park.occupancyRate < 75) return 'Orta yoğunluk';
    return 'Yoğun olabilir';
  }
  return 'Yoğun değil';
}

function crowdColor(park) {
  if (typeof park.occupancyRate === 'number') {
    if (park.occupancyRate < 45) return GREEN_ACCENT;
    if (park.occupancyRate < 75) return '#F59E0B';
    return '#EF4444';
  }
  return GREEN_ACCENT;
}

function facilityChips(park) {
  const joined = (park.activities || []).map((a) => String(a).toLowerCase()).join(' ');
  const chips = [];
  if (joined.includes('piknik') || park.type === 'Piknik Alanı') {
    chips.push({ icon: 'table-furniture', label: 'Piknik Masası', family: 'mci' });
  } else {
    chips.push({ icon: 'tree', label: 'Yeşil Alan', family: 'mci' });
  }
  chips.push({ icon: 'car-outline', label: 'Otopark', family: 'ion' });
  chips.push({ icon: 'water-outline', label: 'Çeşme', family: 'ion' });
  return chips.slice(0, 3);
}

function parkMarkerType(park) {
  if (park.type === 'Piknik Alanı') return 'picnic';
  const joined = (park.activities || []).map((a) => String(a).toLowerCase()).join(' ');
  if (joined.includes('piknik')) return 'picnic';
  if (joined.includes('çocuk') || joined.includes('oyun')) return 'playground';
  return 'park';
}

/* ───────── ÖZEL MARKER BİLEŞENİ ───────── */
function ParkMarkerIcon({ type, isSelected }) {
  const size = isSelected ? 52 : 42;
  const iconSize = isSelected ? 22 : 18;

  const configs = {
    park: {
      bg: GREEN,
      borderColor: '#40916C',
      icon: 'pine-tree',
      iconColor: '#fff',
    },
    picnic: {
      bg: BROWN,
      borderColor: BROWN_LIGHT,
      icon: 'table-furniture',
      iconColor: '#fff',
    },
    playground: {
      bg: GREEN_MID,
      borderColor: GREEN_ACCENT,
      icon: 'teddy-bear',
      iconColor: '#fff',
    },
  };

  const cfg = configs[type] || configs.park;

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={[
          markerStyles.outer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: cfg.bg,
            borderColor: isSelected ? '#fff' : cfg.borderColor,
            borderWidth: isSelected ? 3 : 2,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                shadowOpacity: isSelected ? 0.3 : 0.15,
                shadowRadius: isSelected ? 8 : 4,
              },
              android: { elevation: isSelected ? 10 : 4 },
            }),
          },
        ]}
      >
        <MaterialCommunityIcons name={cfg.icon} size={iconSize} color={cfg.iconColor} />
      </View>
      {/* Alt ok */}
      <View
        style={[
          markerStyles.arrow,
          { borderTopColor: cfg.bg },
        ]}
      />
    </View>
  );
}

const markerStyles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});

/* ═══════════ ANA BİLEŞEN ═══════════ */
export default function MapParksScreen({ route, navigation }) {
  const { city, district } = route.params || {};
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [districtCenter, setDistrictCenter] = useState(null);
  const [parks, setParks] = useState([]);
  const [parkCount, setParkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { isDark } = useTheme();

  // Tema Renkleri
  const bg = isDark ? '#0f172a' : BG;
  const cardBg = isDark ? '#1e293b' : CARD_BG;
  const textPrimary = isDark ? '#10b981' : GREEN;
  const textSecondary = isDark ? '#f1f5f9' : '#1a2f25';
  const textMuted = isDark ? '#94a3b8' : '#374151';
  const borderColor = isDark ? '#334155' : 'transparent';
  const iconColor = isDark ? '#10b981' : GREEN;
  const cardShadow = isDark ? { elevation: 2, shadowOpacity: 0.2 } : {};

  // Alt kart animasyonu
  const cardAnim = useRef(new Animated.Value(0)).current;



  /* ── Veri Yükleme ─── */
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        setParks([]);
        setParkCount(0);
        setSelectedId(null);

        // İlçe geocode (opsiyonel, hata olursa devam eder)
        let districtRegion = null;
        if (city && district) {
          try {
            const query = `${district}, ${city}, Türkiye`;
            const geocoded = await Location.geocodeAsync(query);
            if (geocoded && geocoded.length > 0) {
              districtRegion = {
                latitude: geocoded[0].latitude,
                longitude: geocoded[0].longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              };
              setDistrictCenter(districtRegion);
            }
          } catch (e) {
            console.log('İlçe geocode hata:', e);
          }
        }

        // Kullanıcı konumu al
        const { status } = await Location.requestForegroundPermissionsAsync();
        let uLoc = null;
        if (status === 'granted') {
          // Konumu Gümüşhane olarak sabitledik (Kullanıcı İsteği)
          uLoc = {
            latitude: 40.4608,
            longitude: 39.4803,
          };
          setUserLocation(uLoc);
          console.log('Kullanıcı konumu (Gümüşhane sabit):', uLoc.latitude, uLoc.longitude);
        } else {
          setUserLocation(null);
        }

        // Dummy verileri kullan
        const rawList = getDummyParks(city, district);
        const normalized = rawList.map(normalizePark).filter((p) => p.lat != null && p.lon != null);
        setParkCount(normalized.length);

        const withDist = normalized.map((p) => {
          if (
            uLoc &&
            p.lat != null &&
            p.lon != null &&
            Number.isFinite(p.lat) &&
            Number.isFinite(p.lon)
          ) {
            const distKm = getDistanceKm(uLoc.latitude, uLoc.longitude, p.lat, p.lon);
            return { ...p, distance: distKm.toFixed(2), distanceKm: distKm };
          }
          return { ...p, distance: null, distanceKm: null };
        });

        withDist.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        setParks(withDist);
        setSelectedId(withDist[0]?.id ?? null);

        // Kart giriş animasyonu
        Animated.spring(cardAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();

        if (
          !districtRegion &&
          mapRef.current &&
          withDist[0]?.lat != null &&
          withDist[0]?.lon != null
        ) {
          setTimeout(() => {
            mapRef.current?.animateToRegion(
              {
                latitude: Number(withDist[0].lat),
                longitude: Number(withDist[0].lon),
                latitudeDelta: 0.06,
                longitudeDelta: 0.06,
              },
              600
            );
          }, 100);
        } else if (districtRegion && mapRef.current) {
          setTimeout(() => {
            mapRef.current?.animateToRegion(districtRegion, 600);
          }, 100);
        }
      } catch (error) {
        console.log('MapParks hata:', error);
        setLoadError('Bir hata oluştu. Lütfen tekrar deneyin.');
        setParks([]);
        setParkCount(0);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [city, district]);

  /* ── Parklar yüklenince otom. fit ─── */
  useEffect(() => {
    if (loading || parks.length === 0 || !mapRef.current) return;
    const coords = parks
      .filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon)))
      .map((p) => ({
        latitude: Number(p.lat),
        longitude: Number(p.lon),
      }));
    if (coords.length === 0) return;

    const timer = setTimeout(() => {
      try {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: {
            top: insets.top + 200,
            right: 36,
            bottom: 280,
            left: 36,
          },
          animated: true,
        });
      } catch (e) {
        console.log('fitToCoordinates:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [loading, parks, insets.top]);

  /* ── Seçili Park ─── */
  const selectedPark = useMemo(
    () => parks.find((p) => p.id === selectedId) || parks[0] || null,
    [parks, selectedId]
  );

  const metersToSelected = useMemo(() => {
    if (!selectedPark || selectedPark.distanceKm == null) return null;
    if (!Number.isFinite(selectedPark.distanceKm)) return null;
    return Math.round(selectedPark.distanceKm * 1000);
  }, [selectedPark]);

  const distanceLabel = useMemo(() => {
    if (metersToSelected == null) return null;
    if (metersToSelected >= 1000) {
      return `${(metersToSelected / 1000).toFixed(1)}km uzaklıkta`;
    }
    return `${metersToSelected}m uzaklıkta`;
  }, [metersToSelected]);

  /* ── Marker'a basılınca ─── */
  const onMarkerSelect = useCallback(
    (parkId) => {
      setSelectedId(parkId);
      const park = parks.find((p) => p.id === parkId);
      if (park && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: Number(park.lat) - 0.003,
            longitude: Number(park.lon),
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          400
        );
      }
      // Kart bounce
      cardAnim.setValue(0.85);
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    },
    [parks, cardAnim]
  );

  /* ── Yön tarifi aç ─── */
  const openDirections = () => {
    if (!selectedPark?.lat || !selectedPark?.lon) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(selectedPark.name)}@${selectedPark.lat},${selectedPark.lon}`,
      android: `geo:0,0?q=${selectedPark.lat},${selectedPark.lon}(${encodeURIComponent(selectedPark.name)})`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  /* ── Boş / Hata durumları ─── */
  if (!city || !district) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bg }]}>
        <Ionicons name="warning-outline" size={48} color={iconColor} />
        <Text style={[styles.infoText, { color: textPrimary }]}>İl veya ilçe bilgisi eksik.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={iconColor} />
        <Text style={[styles.infoText, { color: textPrimary }]}>Harita ve parklar yükleniyor…</Text>
        <Text style={[styles.infoSubText, { color: textMuted }]}>{district}, {city} aranıyor</Text>
      </View>
    );
  }

  /* ═══════════ RENDER ═══════════ */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      {/* ── Üst Bar ── */}
      <View style={[styles.topBar, { backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={12}>
          <Ionicons name="person-circle-outline" size={28} color={iconColor} />
        </TouchableOpacity>
        <Text style={[styles.brand, { color: iconColor }]}>APAYS</Text>
        <TouchableOpacity onPress={() => Alert.alert('Arama', 'Park araması yakında.')} hitSlop={12}>
          <Ionicons name="search-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* ── Harita Alanı ── */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
          customMapStyle={Platform.OS === 'android' ? natureMapStyle : undefined}
          initialRegion={{
            latitude: districtCenter?.latitude ?? 39.9334,
            longitude: districtCenter?.longitude ?? 32.8597,
            latitudeDelta: districtCenter?.latitudeDelta ?? 0.09,
            longitudeDelta: districtCenter?.longitudeDelta ?? 0.09,
          }}
        >
          {parks.map((park) => {
            const lat = Number(park.lat);
            const lon = Number(park.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
            const isSelected = park.id === selectedPark?.id;
            const mType = parkMarkerType(park);

            return (
              <Marker
                key={String(park.id)}
                coordinate={{ latitude: lat, longitude: lon }}
                onPress={() => onMarkerSelect(park.id)}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 1 }}
              >
                <ParkMarkerIcon type={mType} isSelected={isSelected} />

                {/* ── Callout Tooltip ── */}
                <Callout
                  tooltip
                  onPress={() => navigation.navigate('ParkDetail', { park })}
                >
                  <View style={styles.tooltipContainer}>
                    <View style={styles.tooltipCard}>
                      <Text style={styles.tooltipTitle} numberOfLines={1}>
                        {park.name}
                      </Text>
                      <View style={styles.tooltipRow}>
                        <Text style={styles.tooltipDist}>
                          {park.distance != null
                            ? `${(park.distanceKm * 1000).toFixed(0)}m`
                            : '—'}
                        </Text>
                        <View style={styles.tooltipDot} />
                        <Text
                          style={[
                            styles.tooltipCrowd,
                            { color: crowdColor(park) },
                          ]}
                        >
                          {crowdLabel(park)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tooltipArrow} />
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* ── Konum + Filtre Kartı ── */}
        <View style={[styles.overlayCol, { top: Math.max(insets.top, 8) + 52 }]}>
          <View style={[styles.locationCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }, cardShadow]}>
            <View style={[styles.locationIconWrap, { backgroundColor: isDark ? '#334155' : GREEN_LIGHT }]}>
              <Ionicons name="locate" size={18} color={iconColor} />
            </View>
            <Text style={[styles.locationText, { color: textSecondary }]} numberOfLines={1}>
              {district}, {city}
            </Text>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: isDark ? '#334155' : '#f0f4f0' }]}
              onPress={() => Alert.alert('Filtre', 'Filtre seçenekleri yakında.')}
            >
              <Ionicons name="options-outline" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
          <View style={[styles.countPill, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }, cardShadow]}>
            <Text style={[styles.countPillText, { color: textMuted }]}>
              {loadError
                ? `${district} ilçesinde park sayısı şu an alınamıyor`
                : `${district} ilçesinde ${parkCount} park bulunuyor`}
            </Text>
            {loadError ? <Text style={styles.countPillError}>{loadError}</Text> : null}
          </View>
        </View>

        {/* ── Konum Butonu ── */}
        <TouchableOpacity
          style={[styles.myLocationBtn, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0, top: Math.max(insets.top, 8) + 140 }, cardShadow]}
          onPress={() => {
            if (userLocation && mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                },
                400
              );
            }
          }}
        >
          <Ionicons name="navigate" size={20} color={iconColor} />
        </TouchableOpacity>

        {/* ── Boş durum ── */}
        {!loadError && parks.length === 0 ? (
          <View style={[styles.emptyFloating, { bottom: Math.max(insets.bottom, 12) + 64 }]}>
            <MaterialCommunityIcons name="pine-tree" size={32} color={GREEN_MID} />
            <Text style={styles.emptyFloatingText}>
              Bu ilçe için henüz park kaydı bulunamadı.
            </Text>
          </View>
        ) : null}

        {/* ── Alt Bilgi Kartı ── */}
        {selectedPark ? (
          <Animated.View
            style={[
              styles.bottomCard,
              { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 },
              { paddingBottom: Math.max(insets.bottom, 12) + 64 },
              {
                transform: [{ scale: cardAnim }],
                opacity: cardAnim,
              },
              cardShadow,
            ]}
          >
            {/* Üst çizgi göstergesi */}
            <View style={styles.cardHandle} />

            <View style={styles.cardTopRow}>
              <View style={styles.badgeNearest}>
                <Text style={styles.badgeNearestText}>
                  {parks[0] && selectedPark?.id === parks[0].id ? 'EN YAKIN' : 'SEÇİLİ'}
                </Text>
              </View>
              <TouchableOpacity style={styles.navSquare} onPress={openDirections}>
                <Ionicons name="navigate" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={1}>
              {selectedPark.name}
            </Text>

            <View style={styles.cardDistRow}>
              <Ionicons name="location" size={16} color={GREEN_ACCENT} />
              <Text style={styles.cardDistText}>
                {distanceLabel
                  ? distanceLabel
                  : 'Mesafe bilgisi için konum izni verin'}
              </Text>
            </View>

            {/* ── Tesis Chip'leri ── */}
            <View style={styles.facilityRow}>
              {facilityChips(selectedPark).map((f) => (
                <View key={f.label} style={[styles.facilityChip, { backgroundColor: isDark ? '#334155' : '#f0f4f0' }]}>
                  {f.family === 'mci' ? (
                    <MaterialCommunityIcons name={f.icon} size={20} color={iconColor} />
                  ) : (
                    <Ionicons name={f.icon} size={20} color={iconColor} />
                  )}
                  <Text style={[styles.facilityLabel, { color: textSecondary }]}>{f.label}</Text>
                </View>
              ))}
            </View>

            {/* ── Detay Butonu ── */}
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ParkDetail', { park: selectedPark })}
            >
              <Text style={styles.primaryBtnText}>Detayları İncele</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>

      {/* ── Alt Navigasyon ── */}
      <View style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <ExploreBottomNav
          navigation={navigation}
          activeTab="map"
          mapContext={route.params}
        />
      </View>
    </SafeAreaView>
  );
}

/* ═══════════ STİLLER ═══════════ */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  /* ── Üst Bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BG,
  },
  brand: { fontSize: 18, fontWeight: '800', color: GREEN, letterSpacing: 1.2 },

  /* ── Harita ── */
  mapWrap: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },

  /* ── Overlay ── */
  overlayCol: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 2,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  locationIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1a2f25' },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0f4f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  countPill: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: CARD_BG,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  countPillText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  countPillError: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b45309',
    marginTop: 6,
    lineHeight: 17,
  },

  /* ── Konum Butonu ── */
  myLocationBtn: {
    position: 'absolute',
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },

  /* ── Tooltip ── */
  tooltipContainer: {
    alignItems: 'center',
  },
  tooltipCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 160,
    maxWidth: 240,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  tooltipTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: GREEN,
    marginBottom: 4,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipDist: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  tooltipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
    marginHorizontal: 6,
  },
  tooltipCrowd: {
    fontSize: 12,
    fontWeight: '600',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: CARD_BG,
    marginTop: -1,
  },

  /* ── Alt Kart ── */
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 20 },
    }),
  },
  cardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeNearest: {
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeNearestText: { fontSize: 11, fontWeight: '800', color: GREEN, letterSpacing: 0.5 },
  navSquare: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#14241c', marginBottom: 6 },
  cardDistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardDistText: { marginLeft: 6, fontSize: 14, color: '#4b5563', fontWeight: '600' },

  /* ── Tesis Chip'leri ── */
  facilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  facilityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7f0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginHorizontal: 3,
  },
  facilityLabel: {
    fontSize: 11,
    color: '#374151',
    marginLeft: 5,
    fontWeight: '600',
  },

  /* ── ButonlarA ── */
  primaryBtn: {
    backgroundColor: GREEN,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  /* ── Alt Tab Bar ── */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  tabItem: { alignItems: 'center', minWidth: 64 },
  tabActiveSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  tabLabel: { fontSize: 11, fontWeight: '600', color: GREEN, marginTop: 2 },
  tabLabelActive: { color: GREEN },

  /* ── Diğer ── */
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5faf5',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: GREEN,
    textAlign: 'center',
    marginTop: 12,
  },
  infoSubText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyFloating: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyFloatingText: { fontSize: 13, color: '#4b5563', textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
