import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { getApiBaseUrl } from '../config/api';

export default function EventsScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Tümü');

    const fetchEvents = async () => {
        try {
            const baseUrl = getApiBaseUrl();
            const response = await fetch(`${baseUrl}/api/events`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error('Etkinlikler çekilemedi:', error);
            Alert.alert('Hata', 'Etkinlikler yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleJoin = async (eventId) => {
        try {
            const baseUrl = getApiBaseUrl();

            const response = await fetch(`${baseUrl}/api/events/${eventId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Başarılı', data.message);
                fetchEvents();
            } else {
                Alert.alert('Uyarı', data.message || 'Katılım yapılamadı.');
            }
        } catch (error) {
            console.error('Katılım hatası:', error);
            Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
        }
    };

    const filteredEvents = events.filter((event) => {
        if (filter === 'Tümü') return true;
        if (filter === 'Katılımlı') return event.AllowParticipation === true;
        if (filter === 'Duyuru') return event.AllowParticipation === false;
        return true;
    });

    const renderEvent = ({ item }) => {
        const isFull =
            item.AllowParticipation &&
            Number(item.ParticipantCount) >= Number(item.Capacity);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.eventTitle}>{item.Title}</Text>

                    <View
                        style={[
                            styles.badge,
                            item.AllowParticipation ? styles.joinBadge : styles.infoBadge,
                        ]}
                    >
                        <Text style={styles.badgeText}>
                            {item.AllowParticipation ? 'Katılımlı' : 'Duyuru'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.parkText}>📍 {item.ParkName}</Text>
                <Text style={styles.dateText}>📅 {item.Date} - {item.Time}</Text>

                <Text style={styles.description}>{item.Description}</Text>

                {item.AllowParticipation ? (
                    <View style={styles.participationBox}>
                        <Text style={styles.participantText}>
                            Katılan: {item.ParticipantCount} / {item.Capacity}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.joinButton,
                                isFull && styles.disabledButton,
                            ]}
                            disabled={isFull}
                            onPress={() => handleJoin(item.Id)}
                        >
                            <Text style={styles.joinButtonText}>
                                {isFull ? 'Kontenjan Doldu' : 'Katıl'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.noticeBox}>
                        <Text style={styles.noticeText}>
                            Bu etkinlik sadece bilgilendirme amaçlıdır.
                        </Text>
                    </View>
                )}

                <Text style={styles.createdBy}>
                    Oluşturan: {item.CreatedBy || 'Yetkili'}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Etkinlikler</Text>

            <View style={styles.filterRow}>
                {['Tümü', 'Katılımlı', 'Duyuru'].map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.filterButton,
                            filter === item && styles.activeFilterButton,
                        ]}
                        onPress={() => setFilter(item)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === item && styles.activeFilterText,
                            ]}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#124d57" style={{ marginTop: 40 }} />
            ) : filteredEvents.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz etkinlik bulunmuyor.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item.Id.toString()}
                    renderItem={renderEvent}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e9f8f6',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#124d57',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    filterButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 5,
        elevation: 2,
    },
    activeFilterButton: {
        backgroundColor: '#124d57',
    },
    filterText: {
        color: '#124d57',
        fontWeight: '600',
    },
    activeFilterText: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginLeft: 8,
    },
    joinBadge: {
        backgroundColor: '#d1fae5',
    },
    infoBadge: {
        backgroundColor: '#dbeafe',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#124d57',
    },
    parkText: {
        fontSize: 14,
        color: '#334155',
        marginTop: 4,
    },
    dateText: {
        fontSize: 14,
        color: '#334155',
        marginTop: 4,
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    participationBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        marginTop: 5,
    },
    participantText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#124d57',
        marginBottom: 10,
    },
    joinButton: {
        backgroundColor: '#10b981',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#94a3b8',
    },
    joinButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noticeBox: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 12,
        marginTop: 5,
    },
    noticeText: {
        color: '#1e40af',
        fontSize: 14,
        fontWeight: '600',
    },
    createdBy: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 10,
        textAlign: 'right',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16,
    },
});