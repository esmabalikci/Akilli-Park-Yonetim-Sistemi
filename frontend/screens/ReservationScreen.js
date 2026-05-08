import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { getApiBaseUrl } from '../config/api';

export default function ReservationScreen({ route }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReservations = async () => {
        try {
            const baseUrl = getApiBaseUrl();

            const response = await fetch(`${baseUrl}/api/reservations`);
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
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const renderReservationItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.areaTitle}>
                    {item.ParkName || `Park ID: ${item.PicnicAreaId || item.id}`}
                </Text>

                <View style={[styles.statusBadge, styles.activeBadge]}>
                    <Text style={styles.statusText}>{item.Status || 'Aktif'}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.infoText}>
                    📅 Başlangıç: {new Date(item.StartTime).toLocaleString('tr-TR')}
                </Text>

                <Text style={styles.infoText}>
                    ⌛ Bitiş: {new Date(item.EndTime).toLocaleString('tr-TR')}
                </Text>
            </View>

            <Text style={styles.footerText}>
                Kayıt Tarihi: {new Date(item.CreatedAt || Date.now()).toLocaleDateString('tr-TR')}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Rezervasyonlarım</Text>

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#124d57"
                    style={{ marginTop: 50 }}
                />
            ) : reservations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Henüz bir rezervasyonunuz bulunmuyor.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={reservations}
                    keyExtractor={(item, index) =>
                        item.Id
                            ? item.Id.toString()
                            : item.id
                                ? item.id.toString()
                                : index.toString()
                    }
                    renderItem={renderReservationItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#124d57',
        margin: 20,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 10,
        marginBottom: 10,
    },
    areaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 10,
    },
    activeBadge: {
        backgroundColor: '#d1fae5',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#124d57',
    },
    cardBody: {
        marginTop: 5,
    },
    infoText: {
        fontSize: 14,
        color: '#475569',
        marginVertical: 2,
    },
    footerText: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 10,
        textAlign: 'right',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16,
    },
});