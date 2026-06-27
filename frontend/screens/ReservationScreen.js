import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getApiBaseUrl } from '../config/api';
import { apiFetch } from '../utils/apiClient';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import StarRating from '../components/StarRating';
import TurkishTextInput from '../components/TurkishTextInput';
import {
    fetchPendingReservationSurveys,
    submitReservationSurvey,
    ratingLabel,
} from '../utils/parkReviews';
import { theme } from '../theme/colors';
import { formatTurkeyDateTime } from '../utils/dateTime';

export default function ReservationScreen({ navigation }) {
    const { user } = useUser();
    const { isDark } = useTheme();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingSurvey, setPendingSurvey] = useState(null);
    const [surveyRating, setSurveyRating] = useState(0);
    const [surveyText, setSurveyText] = useState('');
    const [submittingSurvey, setSubmittingSurvey] = useState(false);

    // Tema Renkleri
    const bg = isDark ? '#0f172a' : '#e6f7f5';
    const cardBg = isDark ? '#1e293b' : '#fff';
    const textPrimary = isDark ? '#10b981' : theme.title;
    const textSecondary = isDark ? '#94a3b8' : theme.text;
    const textMuted = isDark ? '#64748b' : theme.textMuted;
    const borderColor = isDark ? '#334155' : theme.border;

    const checkPendingSurveys = async () => {
        if (!user?.id) return;
        try {
            const pending = await fetchPendingReservationSurveys();
            if (pending.length > 0) {
                setPendingSurvey(pending[0]);
                setSurveyRating(0);
                setSurveyText('');
            }
        } catch (error) {
            console.error('Bekleyen anketler:', error);
        }
    };

    const fetchReservations = async () => {
        try {
            const { response, data } = await apiFetch('/api/reservations');

            if (response.ok && Array.isArray(data)) {
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
            checkPendingSurveys();
        }, [user?.id])
    );

    const handleSubmitSurvey = async () => {
        if (surveyRating < 1) return;
        setSubmittingSurvey(true);
        try {
            await submitReservationSurvey({
                reservationId: pendingSurvey.reservationId,
                rating: surveyRating,
                text: surveyText,
            });
            setPendingSurvey(null);
            await checkPendingSurveys();
        } catch (error) {
            console.error('Anket kaydedilemedi:', error);
        } finally {
            setSubmittingSurvey(false);
        }
    };

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
            <Modal
                visible={Boolean(pendingSurvey)}
                transparent
                animationType="slide"
                onRequestClose={() => setPendingSurvey(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.surveyModal, { backgroundColor: cardBg }]}>
                        <Text style={[styles.surveyTitle, { color: textPrimary }]}>
                            Deneyiminizi değerlendirin
                        </Text>
                        <Text style={[styles.surveySubtitle, { color: textSecondary }]}>
                            {pendingSurvey?.parkName} rezervasyonunuz tamamlandı. Memnuniyet anketine katılır mısınız?
                        </Text>
                        <StarRating value={surveyRating} interactive onChange={setSurveyRating} size="lg" />
                        {surveyRating > 0 && (
                            <Text style={[styles.surveyHint, { color: textMuted }]}>
                                {ratingLabel(surveyRating)}
                            </Text>
                        )}
                        <TurkishTextInput
                            variant="multiline"
                            style={[styles.surveyInput, { borderColor, color: textSecondary }]}
                            placeholder="Yorumunuz (isteğe bağlı)"
                            placeholderTextColor={textMuted}
                            value={surveyText}
                            onChangeText={setSurveyText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.surveyBtn, surveyRating < 1 && styles.surveyBtnDisabled]}
                            onPress={handleSubmitSurvey}
                            disabled={surveyRating < 1 || submittingSurvey}
                        >
                            {submittingSurvey ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.surveyBtnText}>Gönder</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPendingSurvey(null)}>
                            <Text style={[styles.surveySkip, { color: textMuted }]}>Daha sonra</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    surveyModal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    surveyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    surveySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    surveyHint: {
        fontSize: 13,
        marginTop: 8,
        marginBottom: 12,
    },
    surveyInput: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        minHeight: 80,
        marginTop: 12,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    surveyBtn: {
        backgroundColor: theme.primary,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    surveyBtnDisabled: {
        opacity: 0.5,
    },
    surveyBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    surveySkip: {
        marginTop: 14,
        fontSize: 14,
        fontWeight: '600',
    },
});
