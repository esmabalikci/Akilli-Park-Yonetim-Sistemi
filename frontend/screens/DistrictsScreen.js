import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { districtsData } from '../data/districtsData';
import TurkishTextInput from '../components/TurkishTextInput';
import { useTheme } from '../context/ThemeContext';

export default function DistrictsScreen({ route, navigation }) {
  const { city } = route.params;
  const { isDark } = useTheme();
  const [searchText, setSearchText] = useState('');

  const districts = districtsData[city] || [];

  const filteredDistricts = useMemo(() => {
    const q = searchText.trim().toLocaleLowerCase('tr-TR');
    if (!q) return districts;
    return districts.filter((district) =>
      district.toLocaleLowerCase('tr-TR').includes(q)
    );
  }, [districts, searchText]);

  // Tema renkleri
  const bg = isDark ? '#0f172a' : '#dff1f4';
  const textPrimary = isDark ? '#10b981' : '#0f5c69';
  const searchBg = isDark ? '#1e293b' : '#fff';
  const searchBorder = isDark ? '#334155' : 'transparent';
  const searchInputText = isDark ? '#f8fafc' : '#333';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const itemText = isDark ? '#e2e8f0' : '#124d57';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textPrimary }]}>{city} / İlçe Seçin</Text>

      <TurkishTextInput
        variant="search"
        style={[styles.searchInput, { backgroundColor: searchBg, borderColor: searchBorder, borderWidth: isDark ? 1 : 0, color: searchInputText }]}
        placeholder="İlçe ara..."
        placeholderTextColor={isDark ? '#64748b' : '#999'}
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredDistricts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: cardBg, borderColor: searchBorder, borderWidth: isDark ? 1 : 0 }]}
            onPress={() => navigation.navigate('MapParks', { city, district: item })}          >
            <Text style={[styles.itemText, { color: itemText }]}>{item}</Text>
            <Text style={[styles.arrow, { color: isDark ? '#475569' : '#124d57' }]}>›</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dff1f4', padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f5c69',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
    elevation: 2,
  },
  itemCard: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: { fontSize: 16, fontWeight: '600', color: '#124d57' },
  arrow: { fontSize: 24, color: '#124d57', fontWeight: 'bold' },
});