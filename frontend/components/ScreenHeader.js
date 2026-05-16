import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';

export default function ScreenHeader({ title, onBack, rightAction }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.title} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {rightAction || <View style={styles.backPlaceholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: theme.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: theme.title,
    textAlign: 'center',
  },
});
