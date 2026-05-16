import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const GREEN = '#1B4332';
const TAB_ACTIVE = '#1B4332';

/**
 * @param {'map'|'explore'|'favorites'|'profile'} activeTab
 */
export default function ExploreBottomNav({ navigation, activeTab, mapContext }) {
  const { user } = useUser();

  const goProfile = () => {
    navigation.navigate('Profile', { user });
  };

  const goFavorites = () => {
    navigation.navigate('Favorites');
  };

  const goExplore = () => {
    navigation.navigate('Cities');
  };

  const goMap = () => {
    if (mapContext?.city && mapContext?.district) {
      navigation.navigate('MapParks', mapContext);
      return;
    }
    Alert.alert(
      'Harita',
      'Haritayı görmek için önce Keşfet üzerinden il ve ilçe seçin.'
    );
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.tabItem} onPress={goMap}>
        {activeTab === 'map' ? (
          <View style={styles.tabPill}>
            <Ionicons name="map" size={22} color="#fff" />
            <Text style={[styles.tabLabelActive, styles.tabLabelActiveSpacing]}>Harita</Text>
          </View>
        ) : (
          <>
            <Ionicons name="map-outline" size={22} color={GREEN} />
            <Text style={styles.tabLabel}>Harita</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={goExplore}>
        {activeTab === 'explore' ? (
          <View style={styles.tabPill}>
            <Ionicons name="compass" size={22} color="#fff" />
            <Text style={[styles.tabLabelActive, styles.tabLabelActiveSpacing]}>Keşfet</Text>
          </View>
        ) : (
          <>
            <Ionicons name="compass-outline" size={22} color={GREEN} />
            <Text style={styles.tabLabel}>Keşfet</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={goFavorites}>
        {activeTab === 'favorites' ? (
          <View style={styles.tabPill}>
            <Ionicons name="heart" size={22} color="#fff" />
            <Text style={[styles.tabLabelActive, styles.tabLabelActiveSpacing]}>Favoriler</Text>
          </View>
        ) : (
          <>
            <Ionicons name="heart-outline" size={22} color={GREEN} />
            <Text style={styles.tabLabel}>Favoriler</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={goProfile}>
        {activeTab === 'profile' ? (
          <View style={styles.tabPill}>
            <Ionicons name="person" size={22} color="#fff" />
            <Text style={[styles.tabLabelActive, styles.tabLabelActiveSpacing]}>Profil</Text>
          </View>
        ) : (
          <>
            <Ionicons name="person-outline" size={22} color={GREEN} />
            <Text style={styles.tabLabel}>Profil</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 12 },
    }),
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingVertical: 4,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TAB_ACTIVE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: GREEN,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  tabLabelActiveSpacing: { marginLeft: 6 },
});
