import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import gazeboImage from '../assets/gazebo.png';
import { apiFetch } from '../utils/apiClient';
import { getParkKey } from '../utils/parkKey';

export default function CottageSelectionScreen({ route, navigation }) {
  const { park } = route.params;
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCottages = async () => {
      try {
        const parkOsmId = encodeURIComponent(getParkKey(park));
        const count = park?.cottageCount || 20;
        const { response, data } = await apiFetch(
          `/api/picnic-areas/${parkOsmId}?count=${count}`
        );

        if (response.ok && data.success && Array.isArray(data.cottages)) {
          setCottages(data.cottages);
        } else {
          setCottages(
            Array.from({ length: count }, (_, index) => ({
              id: index + 1,
              name: `${index + 1} Numaralı Çardak`,
              available: true,
            }))
          );
        }
      } catch {
        const count = park?.cottageCount || 20;
        setCottages(
          Array.from({ length: count }, (_, index) => ({
            id: index + 1,
            name: `${index + 1} Numaralı Çardak`,
            available: true,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    loadCottages();
  }, [park]);

  const handleSelectCottage = (cottage) => {
    if (cottage.available === false) {
      Alert.alert('Müsait Değil', 'Bu çardak şu an rezerve edilmiş görünüyor.');
      return;
    }

    navigation.navigate('CottageCameraScreen', {
      park,
      cottage,
    });
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

        <Text style={styles.headerTitle}>Çardak Seç</Text>

        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.parkName}>{park?.name || 'Park'}</Text>

        <Text style={styles.description}>
          Rezervasyon yapmadan önce kullanmak istediğiniz çardağı seçin.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {cottages.map((cottage) => {
              const unavailable = cottage.available === false;
              return (
                <TouchableOpacity
                  key={cottage.id}
                  style={[
                    styles.cottageButton,
                    unavailable && styles.cottageButtonDisabled,
                  ]}
                  onPress={() => handleSelectCottage(cottage)}
                  disabled={unavailable}
                >
                  <Image source={gazeboImage} style={styles.cottageImage} />

                  <View style={styles.cottageInfo}>
                    <Text style={[styles.cottageNumber, unavailable && styles.disabledText]}>
                      {cottage.id}
                    </Text>
                    <Text style={[styles.cottageText, unavailable && styles.disabledText]}>
                      {unavailable ? 'Dolu' : 'Çardak'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    padding: 16,
  },
  parkName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#065f46',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cottageButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cottageButtonDisabled: {
    opacity: 0.55,
    borderLeftColor: '#94a3b8',
  },
  cottageImage: {
    width: 80,
    height: 60,
    resizeMode: 'contain',
    marginRight: 8,
  },
  cottageInfo: {
    flex: 1,
    alignItems: 'center',
  },
  cottageNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#064e3b',
  },
  cottageText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
    marginTop: 2,
  },
  disabledText: {
    color: '#94a3b8',
  },
});
