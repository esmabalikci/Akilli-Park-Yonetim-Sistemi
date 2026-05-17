import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import gazeboImage from '../assets/gazebo.png';

export default function CottageSelectionScreen({ route, navigation }) {
  const { park } = route.params;

  const cottageCount = park?.cottageCount || 20;

  const cottages = Array.from({ length: cottageCount }, (_, index) => ({
    id: index + 1,
    name: `${index + 1} Numaralı Çardak`,
  }));

  const handleSelectCottage = (cottage) => {
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

        <View style={styles.grid}>
          {cottages.map((cottage) => (
            <TouchableOpacity
              key={cottage.id}
              style={styles.cottageButton}
              onPress={() => handleSelectCottage(cottage)}
            >
              <Image source={gazeboImage} style={styles.cottageImage} />

              <View style={styles.cottageInfo}>
                <Text style={styles.cottageNumber}>{cottage.id}</Text>
                <Text style={styles.cottageText}>Çardak</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
});