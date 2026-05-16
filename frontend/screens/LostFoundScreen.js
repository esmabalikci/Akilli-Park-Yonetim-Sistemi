import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl } from '../config/api';
import TurkishTextInput from '../components/TurkishTextInput';
import { useUser } from '../context/UserContext';

export default function LostFoundScreen() {
    const { user } = useUser();
    const [items, setItems] = useState([]);
    const [filteredType, setFilteredType] = useState('Tümü');
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [type, setType] = useState('Kayıp');
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [parkName, setParkName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);

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
        setEditingItemId(null);
    };

    const handleSubmit = async () => {
        if (!itemName.trim() || !description.trim() || !parkName.trim()) {
            Alert.alert('Hata', 'Lütfen eşya adı, açıklama ve park adı alanlarını doldurun.');
            return;
        }

        try {
            const baseUrl = getApiBaseUrl();
            const requestBody = {
                UserId: user?.id || 1,
                Type: type,
                ItemName: itemName,
                Description: description,
                ParkName: parkName,
                ContactInfo: contactInfo,
                Status: 'Açık',
            };

            const url = editingItemId 
                ? `${baseUrl}/api/lost-found/${editingItemId}`
                : `${baseUrl}/api/lost-found`;
            
            const method = editingItemId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Başarılı', editingItemId ? 'İlan güncellendi.' : 'İlan oluşturuldu.');
                setModalVisible(false);
                resetForm();
                fetchItems();
            } else {
                Alert.alert('Hata', data.message || 'İşlem başarısız.');
            }
        } catch (error) {
            console.error('İlan kaydetme hatası:', error);
            Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'İlanı Sil',
            'Bu ilanı silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const baseUrl = getApiBaseUrl();
                            const response = await fetch(`${baseUrl}/api/lost-found/${id}`, {
                                method: 'DELETE'
                            });
                            const data = await response.json();
                            if (response.ok && data.success) {
                                Alert.alert('Silindi', 'İlan başarıyla silindi.');
                                fetchItems();
                            } else {
                                Alert.alert('Hata', data.message || 'Silinemedi.');
                            }
                        } catch (error) {
                            console.error('Silme hatası:', error);
                            Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (item) => {
        setType(item.Type);
        setItemName(item.ItemName);
        setDescription(item.Description);
        setParkName(item.ParkName);
        setContactInfo(item.ContactInfo || '');
        setEditingItemId(item.Id);
        setModalVisible(true);
    };

    const handleContact = (item) => {
        const contactInfo = item.ContactInfo || '';
        // Sadece rakamları alarak geçerli bir telefon numarası olup olmadığını kontrol et
        const cleanNumber = contactInfo.replace(/\D/g, '');
        const hasNumber = cleanNumber.length >= 10;

        const title = item.Type === 'Bulunan' ? 'Bulan Kişiyle İletişime Geçin' : 'Eşya Sahibiyle İletişime Geçin';
        const message = item.Type === 'Bulunan'
            ? `Eşyanızı teslim almak için bu ilanı oluşturan kişiyle hemen iletişime geçebilirsiniz:\n\n📞 ${contactInfo || 'İletişim bilgisi eklenmemiş'}`
            : `Bu eşyayı bulduysanız veya haber vermek istiyorsanız eşya sahibiyle iletişime geçebilirsiniz:\n\n📞 ${contactInfo || 'İletişim bilgisi eklenmemiş'}`;

        if (!hasNumber) {
            Alert.alert(title, message);
            return;
        }

        Alert.alert(
            title,
            message,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Telefonla Ara',
                    onPress: () => Linking.openURL(`tel:${cleanNumber}`).catch(err => Alert.alert('Hata', 'Arama başlatılamadı.'))
                },
                {
                    text: 'SMS Gönder',
                    onPress: () => Linking.openURL(`sms:${cleanNumber}`).catch(err => Alert.alert('Hata', 'Mesaj uygulaması açılamadı.'))
                }
            ]
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

    const renderItem = ({ item }) => {
        const isOwner = user && String(item.UserId) === String(user.id);

        return (
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

                <View style={styles.actionRow}>
                    {!isOwner ? (
                        <TouchableOpacity style={[styles.contactButton, { flex: 1 }]} onPress={() => handleContact(item)}>
                            <Text style={styles.contactButtonText}>
                                {item.Type === 'Kayıp' ? 'Bilgi Ver' : 'Bu Eşya Benim'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                                <Ionicons name="pencil" size={18} color="#fff" />
                                <Text style={styles.editButtonText}>Düzenle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.Id)}>
                                <Ionicons name="trash" size={18} color="#fff" />
                                <Text style={styles.deleteButtonText}>Sil</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

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

            <TurkishTextInput
                variant="search"
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
                onRequestClose={() => {
                    setModalVisible(false);
                    resetForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>
                                {editingItemId ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
                            </Text>

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
                            <TurkishTextInput
                                variant="text"
                                style={styles.input}
                                placeholder="Örn: Cüzdan, anahtar, telefon"
                                value={itemName}
                                onChangeText={setItemName}
                            />

                            <Text style={styles.label}>Park Adı</Text>
                            <TurkishTextInput
                                variant="text"
                                style={styles.input}
                                placeholder="Örn: Gümüşhane Belediye Parkı"
                                value={parkName}
                                onChangeText={setParkName}
                            />

                            <Text style={styles.label}>Açıklama</Text>
                            <TurkishTextInput
                                variant="multiline"
                                style={[styles.input, styles.textArea]}
                                placeholder="Nerede kayboldu/bulundu? Detay yazın."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />

                            <Text style={styles.label}>İletişim Bilgisi</Text>
                            <TurkishTextInput
                                variant="text"
                                style={styles.input}
                                placeholder="Telefon veya kısa iletişim bilgisi"
                                value={contactInfo}
                                onChangeText={setContactInfo}
                            />

                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSubmit}
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
        justifyContent: 'center',
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
    actionRow: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10,
    },
    contactButton: {
        backgroundColor: '#124d57',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    editButton: {
        flex: 1,
        backgroundColor: '#f59e0b',
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
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