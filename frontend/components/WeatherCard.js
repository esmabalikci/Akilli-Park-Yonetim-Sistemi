import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { weatherIconName, windDirectionLabel } from '../utils/weather';

/**
 * @param {'detail'|'reservation'} variant
 */
export default function WeatherCard({
  variant = 'detail',
  loading = false,
  error = null,
  current = null,
  forecast = null,
  daily = null,
  themeDark = false,
}) {
  const cardBg = themeDark ? '#1e293b' : '#ffffff';
  const textPrimary = themeDark ? '#10b981' : '#065f46';
  const textSecondary = themeDark ? '#94a3b8' : '#334155';
  const borderColor = themeDark ? '#334155' : '#a7f3d0';

  if (loading) {
    return (
      <View style={[styles.card, styles.centered, { backgroundColor: cardBg, borderColor }]}>
        <ActivityIndicator color="#10b981" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>Hava durumu yükleniyor...</Text>
      </View>
    );
  }

  if (error === 'no_coords') {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.headerRow}>
          <Ionicons name="cloud-offline-outline" size={22} color={textSecondary} />
          <Text style={[styles.title, { color: textPrimary }]}>Hava Durumu</Text>
        </View>
        <Text style={[styles.muted, { color: textSecondary }]}>
          Bu park için konum bilgisi bulunmuyor; hava durumu gösterilemiyor.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.muted, { color: textSecondary }]}>{error}</Text>
      </View>
    );
  }

  const snapshot = forecast || current || daily;
  if (!snapshot) return null;

  const icon = weatherIconName(snapshot.weatherCode);
  const windDir = windDirectionLabel(snapshot.windDirection);
  const isReservation = variant === 'reservation';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor },
        isReservation && styles.cardCompact,
        snapshot.picnicSuitable === false && styles.cardWarn,
      ]}
    >
      <View style={styles.headerRow}>
        <Ionicons name={isReservation ? 'calendar-outline' : 'partly-sunny'} size={20} color={textPrimary} />
        <Text style={[styles.title, { color: textPrimary }]}>
          {isReservation ? 'Rezervasyon Günü Hava Durumu' : 'Bugünkü Hava Durumu'}
        </Text>
      </View>

      <View style={styles.mainRow}>
        <Ionicons name={icon} size={42} color="#f59e0b" />
        <View style={styles.tempBlock}>
          <Text style={[styles.temp, { color: textPrimary }]}>
            {snapshot.temperature != null ? `${Math.round(snapshot.temperature)}°C` : '—'}
          </Text>
          <Text style={[styles.desc, { color: textSecondary }]}>{snapshot.description}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Metric
          icon="water-outline"
          label="Yağış"
          value={
            snapshot.precipProbability != null
              ? `%${Math.round(snapshot.precipProbability)}`
              : `${snapshot.precipitation ?? 0} mm`
          }
          textColor={textSecondary}
        />
        <Metric
          icon="speedometer"
          iconFamily="mci"
          label="Rüzgar"
          value={
            snapshot.windSpeed != null
              ? `${Math.round(snapshot.windSpeed)} km/s${windDir ? ` ${windDir}` : ''}`
              : '—'
          }
          textColor={textSecondary}
        />
        {snapshot.humidity != null && (
          <Metric
            icon="humidity"
            iconFamily="mci"
            label="Nem"
            value={`%${Math.round(snapshot.humidity)}`}
            textColor={textSecondary}
          />
        )}
        {daily?.temperatureMin != null && daily?.temperatureMax != null && !isReservation && (
          <Metric
            icon="thermometer"
            iconFamily="mci"
            label="Min/Max"
            value={`${Math.round(daily.temperatureMin)}° / ${Math.round(daily.temperatureMax)}°`}
            textColor={textSecondary}
          />
        )}
      </View>

      {snapshot.picnicTip ? (
        <View
          style={[
            styles.tipBox,
            snapshot.picnicSuitable === false
              ? styles.tipWarn
              : styles.tipOk,
          ]}
        >
          <Ionicons
            name={snapshot.picnicSuitable === false ? 'alert-circle' : 'checkmark-circle'}
            size={18}
            color={snapshot.picnicSuitable === false ? '#b45309' : '#059669'}
          />
          <Text
            style={[
              styles.tipText,
              { color: snapshot.picnicSuitable === false ? '#92400e' : '#065f46', marginLeft: 8 },
            ]}
          >
            {snapshot.picnicTip}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Metric({ icon, iconFamily, label, value, textColor }) {
  const IconComponent = iconFamily === 'mci' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={styles.metric}>
      <IconComponent name={icon} size={16} color="#10b981" />
      <Text style={[styles.metricLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardCompact: {
    marginBottom: 12,
    padding: 14,
  },
  cardWarn: {
    borderColor: '#fcd34d',
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tempBlock: {
    marginLeft: 14,
    flex: 1,
  },
  temp: {
    fontSize: 32,
    fontWeight: '900',
  },
  desc: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  metric: {
    minWidth: '28%',
    flexGrow: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
  },
  tipOk: {
    backgroundColor: '#ecfdf5',
  },
  tipWarn: {
    backgroundColor: '#fffbeb',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  muted: {
    fontSize: 13,
    lineHeight: 20,
  },
});
