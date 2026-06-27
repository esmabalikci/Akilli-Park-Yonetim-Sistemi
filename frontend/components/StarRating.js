import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STAR_COLOR = '#f59e0b';
const STAR_EMPTY = '#cbd5e1';

/**
 * @param {number} value - Seçili yıldız (0 = boş)
 * @param {boolean} interactive - Dokunulabilir mi
 * @param {(rating: number) => void} onChange
 * @param {'sm'|'md'|'lg'} size
 */
export default function StarRating({
  value = 0,
  interactive = false,
  onChange,
  size = 'md',
}) {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 22;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const iconName = filled ? 'star' : 'star-outline';

        if (interactive) {
          return (
            <TouchableOpacity
              key={star}
              onPress={() => onChange?.(star)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={iconSize}
                color={filled ? STAR_COLOR : STAR_EMPTY}
              />
            </TouchableOpacity>
          );
        }

        return (
          <Ionicons
            key={star}
            name={iconName}
            size={iconSize}
            color={filled ? STAR_COLOR : STAR_EMPTY}
            style={styles.staticStar}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  staticStar: {
    marginRight: 2,
  },
});
