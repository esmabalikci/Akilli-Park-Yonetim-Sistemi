import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { getApiBaseUrl } from '../config/api';

export default function LostFoundScreen() {
    const [items, setItems] = useState([]);
    const [filteredType, setFilteredType] = useState('Tümü');
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const [type, setType] = useState('Kayıp');
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [parkName, setParkName] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    const fetchItems = async () => {
        try {
            const baseUrl = getApiBaseUrl();
            const response = await fetch(`${baseUrl}/api/lost-found`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setItems(data);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Kayıp/Bulunan ilanları çekilemedi:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setType('Kayıp');
        setItemName('');
        setDescription('');
        setParkName('');
        setContactInfo('');
    };

    const handleAddItem = async () => {
        if (!itemName.trim() || !description.trim() || !parkName.trim()) {
            Alert.alert('Hata', 'Lütfen eşya adı, açıklama ve park adı alanlarını doldurun.');
            return;
        }

        try {
            const baseUrl = getApiBaseUrl();

            const requestBody = {
                UserId: 1,
                Type: type,
                ItemName: itemName,
                Description: description,
                ParkName: parkName,
                ContactInfo: contactInfo,
                Status: 'Açık',
            };

            const response = await fetch(`${baseUrl}/api/lost-found`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Başarılı', 'İlan başarıyla oluşturuldu.');
                setModalVisible(false);
                resetForm();
                fetchItems();
            } else {
                Alert.alert('Hata', data.message || 'İlan oluşturulamadı.');
            }
        } catch (error) {
            console.error('İlan ekleme hatası:', error);
            Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
        }
    };

    const handleContact = (item) => {
        Alert.alert(
            'İletişim Bilgisi',
            `${item.ItemName} ilanı için iletişim:\n\n${item.ContactInfo || 'İletişim bilgisi yok'}`
        );
    };

    const filteredItems = items.filter((item) => {
        const typeMatch = filteredType === 'Tümü' || item.Type === filteredType;

        const searchMatch =
            item.ItemName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ParkName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.Description?.toLowerCase().includes(searchText.toLowerCase());

        return typeMatch && searchMatch;
    });

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.itemTitle}>{item.ItemName}</Text>
                    <Text
                        style={[
                            styles.typeText,
                            item.Type === 'Kayıp' ? styles.lostText : styles.foundText,
                        ]}
                    >
                        {item.Type}
                    </Text>
                </View>

                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.Status}</Text>
                </View>
            </View>

            <Text style={styles.description}>{item.Description}</Text>

            <Text style={styles.infoText}>📍 Park: {item.ParkName}</Text>
            <Text style={styles.infoText}>
                📅 Tarih: {new Date(item.CreatedAt).toLocaleDateString('tr-TR')}
            </Text>

            <TouchableOpacity style={styles.contactButton} onPress={() => handleContact(item)}>
                <Text style={styles.contactButtonText}>
                    {item.Type === 'Kayıp' ? 'Bilgi Ver' : 'Bu Eşya Benim'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Kayıp / Bulunan</Text>

            <View style={styles.filterRow}>
                {['Tümü', 'Kayıp', 'Bulunan'].map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterButton,
                            filteredType === filter && styles.activeFilterButton,
                        ]}
                        onPress={() => setFilteredType(filter)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filteredType === filter && styles.activeFilterText,
                            ]}
                        >
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Eşya veya park ara..."
                value={searchText}
                onChangeText={setSearchText}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#124d57" style={{ marginTop: 40 }} />
            ) : filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz ilan bulunmuyor.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.Id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Yeni İlan</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Yeni İlan Oluştur</Text>

                            <Text style={styles.label}>İlan Türü</Text>
                            <View style={styles.typeRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        type === 'Kayıp' && styles.selectedTypeButton,
                                    ]}
                                    onPress={() => setType('Kayıp')}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type === 'Kayıp' && styles.selectedTypeText,
                                        ]}
                                    >
                                        Kayıp
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        type === 'Bulunan' && styles.selectedTypeButton,
                                    ]}
                                    onPress={() => setType('Bulunan')}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type === 'Bulunan' && styles.selectedTypeText,
                                        ]}
                                    >
                                        Bulunan
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Eşya Adı</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Cüzdan, anahtar, telefon"
                                value={itemName}
                                onChangeText={setItemName}
                            />

                            <Text style={styles.label}>Park Adı</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Gümüşhane Belediye Parkı"
                                value={parkName}
                                onChangeText={setParkName}
                            />

                            <Text style={styles.label}>Açıklama</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Nerede kayboldu/bulundu? Detay yazın."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />

                            <Text style={styles.label}>İletişim Bilgisi</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Telefon veya kısa iletişim bilgisi"
                                value={contactInfo}
                                onChangeText={setContactInfo}
                            />

                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleAddItem}
                                >
                                    <Text style={styles.modalButtonText}>Kaydet</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetForm();
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>İptal</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e9f8f6',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#124d57',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#fff',
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
    searchInput: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        elevation: 2,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    typeText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 4,
    },
    lostText: {
        color: '#ef4444',
    },
    foundText: {
        color: '#10b981',
    },
    statusBadge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        height: 30,
    },
    statusText: {
        color: '#124d57',
        fontWeight: 'bold',
        fontSize: 12,
    },
    description: {
        color: '#475569',
        fontSize: 14,
        marginBottom: 10,
    },
    infoText: {
        color: '#334155',
        fontSize: 14,
        marginVertical: 2,
    },
    contactButton: {
        backgroundColor: '#124d57',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 14,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 25,
        backgroundColor: '#10b981',
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: 30,
        elevation: 5,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#124d57',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 6,
        marginTop: 10,
    },
    typeRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    selectedTypeButton: {
        backgroundColor: '#124d57',
    },
    typeButtonText: {
        color: '#124d57',
        fontWeight: 'bold',
    },
    selectedTypeText: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
    },
    textArea: {
        height: 90,
        textAlignVertical: 'top',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        width: '47%',
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#10b981',
    },
    cancelButton: {
        backgroundColor: '#ef4444',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});