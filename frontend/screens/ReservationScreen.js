import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getApiBaseUrl } from '../config/api';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { theme } from '../theme/colors';
import { formatTurkeyDateTime } from '../utils/dateTime';

export default function ReservationScreen({ navigation }) {
    const { user } = useUser();
    const { isDark } = useTheme();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Tema Renkleri
    const bg = isDark ? '#0f172a' : '#e6f7f5';
    const cardBg = isDark ? '#1e293b' : '#fff';
    const textPrimary = isDark ? '#10b981' : theme.title;
    const textSecondary = isDark ? '#94a3b8' : theme.text;
    const textMuted = isDark ? '#64748b' : theme.textMuted;
    const borderColor = isDark ? '#334155' : theme.border;

    const fetchReservations = async () => {
        try {
            const baseUrl = getApiBaseUrl();
            const userId = user?.id;
            const url = userId
                ? `${baseUrl}/api/reservations?userId=${userId}`
                : `${baseUrl}/api/reservations`;

            const response = await fetch(url);
            const data = await response.json();

            if (Array.isArray(data)) {
                setReservations(data);
            } else {
                setReservations([]);
            }
        } catch (error) {
            console.error('Rezervasyonlar çekilemedi:', error);
            setReservations([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchReservations();
        }, [user?.id])
    );

    const renderReservationItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.cardHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.areaTitle, { color: textPrimary }]}>
                    {item.ParkName || `Alan #${item.PicnicAreaId || item.id}`}
                </Text>
                <View style={[styles.statusBadge, isDark && { backgroundColor: '#064e3b' }]}>
                    <Text style={[styles.statusText, isDark && { color: '#34d399' }]}>{item.Status || 'Aktif'}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={[styles.infoText, { color: textSecondary }]}>
                    Başlangıç: {formatTurkeyDateTime(item.StartTime)}
                </Text>
                <Text style={[styles.infoText, { color: textSecondary }]}>
                    Bitiş: {formatTurkeyDateTime(item.EndTime)}
                </Text>
            </View>
            <Text style={[styles.footerText, { color: textMuted }]}>
                Kayıt: {formatTurkeyDateTime(item.CreatedAt || new Date())}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['left', 'right', 'bottom']}>
            <ScreenHeader
                title="Rezervasyonlarım"
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={theme.primary}
                    style={styles.loader}
                />
            ) : reservations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyTitle, { color: textPrimary }]}>Henüz rezervasyon yok</Text>
                    <Text style={[styles.emptyText, { color: textSecondary }]}>
                        Parkları keşfedip rezervasyon oluşturduğunuzda burada listelenecek.
                    </Text>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => navigation.navigate('Cities')}
                    >
                        <Text style={styles.ctaText}>Parkları Keşfet</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={reservations}
                    keyExtractor={(item, index) =>
                        item.id ? String(item.id) : String(index)
                    }
                    renderItem={renderReservationItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchReservations();
                            }}
                            colors={[theme.primary]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    loader: {
        marginTop: 48,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 10,
        marginBottom: 10,
    },
    areaTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.title,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#E0F2F1',
        marginLeft: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.primaryDark,
    },
    cardBody: {
        marginTop: 4,
    },
    infoText: {
        fontSize: 14,
        color: theme.text,
        marginVertical: 3,
    },
    footerText: {
        fontSize: 12,
        color: theme.textMuted,
        marginTop: 10,
        textAlign: 'right',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.title,
        marginBottom: 8,
    },
    emptyText: {
        color: theme.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    ctaButton: {
        marginTop: 24,
        backgroundColor: theme.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 24,
    },
    ctaText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
