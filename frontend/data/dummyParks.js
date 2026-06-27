/**
 * Tüm şehir ve ilçeler için dummy park verileri.
 * Anahtar: "Şehir/İlçe" formatında, değer: park dizisi.
 * Her park: id, name, emptySlots, latitude (lat), longitude (lon), type, occupancyRate, capacity, activities
 */

let _idCounter = 1;
const uid = () => String(_idCounter++);

export const dummyParksData = {
  // ══════════════════════════════════
  // İSTANBUL
  // ══════════════════════════════════
  'İstanbul/Kadıköy': [
    { id: uid(), name: 'Moda Sahil Otopark', emptySlots: 20, lat: 40.9847, lon: 29.0267, type: 'Otopark', occupancyRate: 60, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Yoğurtçu Parkı', emptySlots: 35, lat: 40.9880, lon: 29.0300, type: 'Park', occupancyRate: 25, capacity: 48, activities: ['yürüyüş', 'piknik'] },
    { id: uid(), name: 'Kadıköy İSPARK', emptySlots: 0, lat: 40.9910, lon: 29.0220, type: 'Otopark', occupancyRate: 100, capacity: 80, activities: ['otopark'] },
  ],
  'İstanbul/Beşiktaş': [
    { id: uid(), name: 'Yıldız Parkı Otopark', emptySlots: 15, lat: 41.0483, lon: 29.0167, type: 'Otopark', occupancyRate: 70, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Abbasğa Parkı', emptySlots: 25, lat: 41.0450, lon: 29.0050, type: 'Park', occupancyRate: 40, capacity: 42, activities: ['yürüyüş'] },
  ],
  'İstanbul/Fatih': [
    { id: uid(), name: 'Sultanahmet Meydan Otopark', emptySlots: 5, lat: 41.0053, lon: 28.9770, type: 'Otopark', occupancyRate: 90, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Gülhane Parkı', emptySlots: 50, lat: 41.0133, lon: 28.9814, type: 'Park', occupancyRate: 15, capacity: 60, activities: ['yürüyüş', 'piknik'] },
  ],
  'İstanbul/Esenyurt': [
    { id: uid(), name: 'Esenyurt Meydan Otopark', emptySlots: 10, lat: 41.0333, lon: 28.6833, type: 'Otopark', occupancyRate: 80, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Recep Tayyip Erdoğan Parkı', emptySlots: 40, lat: 41.0350, lon: 28.6750, type: 'Park', occupancyRate: 20, capacity: 50, activities: ['yürüyüş', 'piknik'] },
  ],

  // ══════════════════════════════════
  // ADANA
  // ══════════════════════════════════
  'Adana/Seyhan': [
    { id: uid(), name: 'Merkez Park Otopark', emptySlots: 30, lat: 37.0000, lon: 35.3213, type: 'Otopark', occupancyRate: 40, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Seyhan Baraj Parkı', emptySlots: 15, lat: 37.0167, lon: 35.2833, type: 'Park', occupancyRate: 55, capacity: 35, activities: ['yürüyüş', 'piknik'] },
    { id: uid(), name: 'Atatürk Parkı Otopark', emptySlots: 0, lat: 36.9914, lon: 35.3283, type: 'Otopark', occupancyRate: 100, capacity: 60, activities: ['otopark'] },
  ],
  'Adana/Çukurova': [
    { id: uid(), name: 'Çukurova AVM Otopark', emptySlots: 45, lat: 37.0050, lon: 35.2800, type: 'Otopark', occupancyRate: 25, capacity: 60, activities: ['otopark'] },
    { id: uid(), name: 'Çukurova Üniversite Parkı', emptySlots: 20, lat: 37.0567, lon: 35.3500, type: 'Park', occupancyRate: 50, capacity: 40, activities: ['yürüyüş'] },
  ],
  'Adana/Yüreğir': [
    { id: uid(), name: 'Yüreğir Stadyum Otopark', emptySlots: 8, lat: 36.9833, lon: 35.3667, type: 'Otopark', occupancyRate: 80, capacity: 40, activities: ['otopark'] },
    { id: uid(), name: 'Dilberler Piknik Alanı', emptySlots: 35, lat: 37.0100, lon: 35.4000, type: 'Piknik Alanı', occupancyRate: 20, capacity: 45, activities: ['piknik'] },
  ],
  'Adana/Sarıçam': [
    { id: uid(), name: 'Sarıçam Belediye Parkı', emptySlots: 22, lat: 37.0600, lon: 35.3900, type: 'Park', occupancyRate: 35, capacity: 35, activities: ['yürüyüş', 'çocuk oyun'] },
  ],
  'Adana/Ceyhan': [
    { id: uid(), name: 'Ceyhan Merkez Otopark', emptySlots: 18, lat: 37.0300, lon: 35.8100, type: 'Otopark', occupancyRate: 50, capacity: 36, activities: ['otopark'] },
    { id: uid(), name: 'Ceyhan Nehir Kenarı Park', emptySlots: 40, lat: 37.0250, lon: 35.8000, type: 'Park', occupancyRate: 15, capacity: 48, activities: ['yürüyüş', 'piknik'] },
  ],
  'Adana/Kozan': [
    { id: uid(), name: 'Kozan Kalesi Otopark', emptySlots: 12, lat: 37.4500, lon: 35.8167, type: 'Otopark', occupancyRate: 65, capacity: 35, activities: ['otopark'] },
  ],
  'Adana/Karaisalı': [
    { id: uid(), name: 'Kapıkaya Kanyonu Parkı', emptySlots: 50, lat: 37.2500, lon: 35.0667, type: 'Park', occupancyRate: 10, capacity: 55, activities: ['yürüyüş', 'piknik'] },
  ],
  'Adana/Pozantı': [
    { id: uid(), name: 'Pozantı Millet Bahçesi', emptySlots: 25, lat: 37.4300, lon: 34.8700, type: 'Park', occupancyRate: 30, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Adana/Aladağ': [
    { id: uid(), name: 'Aladağ Mesire Alanı', emptySlots: 30, lat: 37.5500, lon: 35.4000, type: 'Piknik Alanı', occupancyRate: 15, capacity: 35, activities: ['piknik', 'yürüyüş'] },
  ],
  'Adana/Feke': [
    { id: uid(), name: 'Feke Belediye Parkı', emptySlots: 20, lat: 37.8100, lon: 35.9100, type: 'Park', occupancyRate: 25, capacity: 28, activities: ['yürüyüş'] },
  ],
  'Adana/İmamoğlu': [
    { id: uid(), name: 'İmamoğlu Merkez Park', emptySlots: 15, lat: 37.2917, lon: 35.6667, type: 'Park', occupancyRate: 40, capacity: 25, activities: ['yürüyüş'] },
  ],
  'Adana/Karataş': [
    { id: uid(), name: 'Karataş Sahil Parkı', emptySlots: 35, lat: 36.5667, lon: 35.3833, type: 'Park', occupancyRate: 20, capacity: 45, activities: ['yürüyüş', 'piknik'] },
  ],
  'Adana/Saimbeyli': [
    { id: uid(), name: 'Saimbeyli Doğa Parkı', emptySlots: 28, lat: 37.9833, lon: 36.1000, type: 'Park', occupancyRate: 15, capacity: 32, activities: ['yürüyüş', 'piknik'] },
  ],
  'Adana/Tufanbeyli': [
    { id: uid(), name: 'Tufanbeyli Meydan Parkı', emptySlots: 18, lat: 38.2667, lon: 36.2167, type: 'Park', occupancyRate: 30, capacity: 25, activities: ['yürüyüş'] },
  ],
  'Adana/Yumurtalık': [
    { id: uid(), name: 'Yumurtalık Marina Parkı', emptySlots: 40, lat: 36.7667, lon: 35.7833, type: 'Park', occupancyRate: 10, capacity: 45, activities: ['yürüyüş', 'piknik'] },
  ],

  // ══════════════════════════════════
  // ADIYAMAN
  // ══════════════════════════════════
  'Adıyaman/Merkez': [
    { id: uid(), name: 'Adıyaman Merkez Otopark', emptySlots: 20, lat: 37.7648, lon: 38.2786, type: 'Otopark', occupancyRate: 50, capacity: 40, activities: ['otopark'] },
    { id: uid(), name: 'Atatürk Bulvarı Parkı', emptySlots: 10, lat: 37.7600, lon: 38.2750, type: 'Park', occupancyRate: 65, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Adıyaman/Kahta': [
    { id: uid(), name: 'Nemrut Dağı Otopark', emptySlots: 55, lat: 37.8813, lon: 38.7400, type: 'Otopark', occupancyRate: 10, capacity: 60, activities: ['otopark'] },
    { id: uid(), name: 'Kahta Çayı Parkı', emptySlots: 30, lat: 37.7900, lon: 38.6200, type: 'Park', occupancyRate: 30, capacity: 42, activities: ['yürüyüş', 'piknik'] },
  ],
  'Adıyaman/Besni': [
    { id: uid(), name: 'Besni Belediye Parkı', emptySlots: 25, lat: 37.6917, lon: 37.8500, type: 'Park', occupancyRate: 35, capacity: 38, activities: ['yürüyüş'] },
  ],
  'Adıyaman/Gölbaşı': [
    { id: uid(), name: 'İnekli Göl Mesire Alanı', emptySlots: 40, lat: 37.7833, lon: 37.6333, type: 'Piknik Alanı', occupancyRate: 15, capacity: 50, activities: ['piknik', 'yürüyüş'] },
  ],
  'Adıyaman/Çelikhan': [
    { id: uid(), name: 'Çelikhan Termal Parkı', emptySlots: 18, lat: 38.0333, lon: 38.2333, type: 'Park', occupancyRate: 40, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Adıyaman/Gerger': [
    { id: uid(), name: 'Gerger Fırat Kenarı Park', emptySlots: 22, lat: 38.0333, lon: 39.0333, type: 'Park', occupancyRate: 25, capacity: 30, activities: ['yürüyüş', 'piknik'] },
  ],
  'Adıyaman/Samsat': [
    { id: uid(), name: 'Samsat Baraj Parkı', emptySlots: 30, lat: 37.5833, lon: 38.8833, type: 'Park', occupancyRate: 20, capacity: 38, activities: ['yürüyüş'] },
  ],
  'Adıyaman/Sincik': [
    { id: uid(), name: 'Sincik Orman Parkı', emptySlots: 35, lat: 38.0333, lon: 38.6167, type: 'Park', occupancyRate: 10, capacity: 40, activities: ['yürüyüş', 'piknik'] },
  ],
  'Adıyaman/Tut': [
    { id: uid(), name: 'Tut Meydan Parkı', emptySlots: 15, lat: 37.7833, lon: 37.9333, type: 'Park', occupancyRate: 45, capacity: 28, activities: ['yürüyüş'] },
  ],

  // ══════════════════════════════════
  // AFYONKARAHİSAR
  // ══════════════════════════════════
  'Afyonkarahisar/Merkez': [
    { id: uid(), name: 'Karahisar Kalesi Otopark', emptySlots: 15, lat: 38.7507, lon: 30.5567, type: 'Otopark', occupancyRate: 60, capacity: 38, activities: ['otopark'] },
    { id: uid(), name: 'Zafer Parkı', emptySlots: 25, lat: 38.7480, lon: 30.5500, type: 'Park', occupancyRate: 35, capacity: 40, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Bolvadin': [
    { id: uid(), name: 'Bolvadin Göl Parkı', emptySlots: 30, lat: 38.7167, lon: 31.0500, type: 'Park', occupancyRate: 25, capacity: 40, activities: ['yürüyüş', 'piknik'] },
  ],
  'Afyonkarahisar/Sandıklı': [
    { id: uid(), name: 'Sandıklı Termal Otopark', emptySlots: 20, lat: 38.4583, lon: 30.2917, type: 'Otopark', occupancyRate: 50, capacity: 40, activities: ['otopark'] },
    { id: uid(), name: 'Hüdai Kaplıca Parkı', emptySlots: 35, lat: 38.4600, lon: 30.2850, type: 'Park', occupancyRate: 20, capacity: 45, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Dinar': [
    { id: uid(), name: 'Dinar Meydan Parkı', emptySlots: 18, lat: 38.0600, lon: 30.1533, type: 'Park', occupancyRate: 45, capacity: 32, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Emirdağ': [
    { id: uid(), name: 'Emirdağ Belediye Parkı', emptySlots: 22, lat: 39.0167, lon: 31.1500, type: 'Park', occupancyRate: 35, capacity: 35, activities: ['yürüyüş', 'çocuk oyun'] },
  ],
  'Afyonkarahisar/Çay': [
    { id: uid(), name: 'Çay Çeşme Parkı', emptySlots: 28, lat: 38.5833, lon: 31.0333, type: 'Park', occupancyRate: 20, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Başmakçı': [
    { id: uid(), name: 'Başmakçı Köy Parkı', emptySlots: 20, lat: 37.8833, lon: 30.0167, type: 'Park', occupancyRate: 30, capacity: 28, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Bayat': [
    { id: uid(), name: 'Bayat Yeşil Park', emptySlots: 25, lat: 38.9667, lon: 30.5833, type: 'Park', occupancyRate: 20, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Çobanlar': [
    { id: uid(), name: 'Çobanlar Meydan Parkı', emptySlots: 15, lat: 38.7000, lon: 30.8167, type: 'Park', occupancyRate: 40, capacity: 25, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Dazkırı': [
    { id: uid(), name: 'Dazkırı Mesire Parkı', emptySlots: 30, lat: 37.8500, lon: 29.8833, type: 'Piknik Alanı', occupancyRate: 15, capacity: 35, activities: ['piknik'] },
  ],
  'Afyonkarahisar/Evciler': [
    { id: uid(), name: 'Evciler Köy Parkı', emptySlots: 20, lat: 37.9667, lon: 29.5000, type: 'Park', occupancyRate: 25, capacity: 25, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Hocalar': [
    { id: uid(), name: 'Hocalar Kasaba Parkı', emptySlots: 18, lat: 38.7667, lon: 30.7000, type: 'Park', occupancyRate: 30, capacity: 22, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/İhsaniye': [
    { id: uid(), name: 'Ayazini Otopark', emptySlots: 35, lat: 38.9167, lon: 30.3667, type: 'Otopark', occupancyRate: 15, capacity: 40, activities: ['otopark'] },
  ],
  'Afyonkarahisar/İscehisar': [
    { id: uid(), name: 'İscehisar Mermer Parkı', emptySlots: 22, lat: 38.8500, lon: 30.5000, type: 'Park', occupancyRate: 30, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Kızılören': [
    { id: uid(), name: 'Kızılören Çam Parkı', emptySlots: 25, lat: 38.5500, lon: 30.5833, type: 'Park', occupancyRate: 20, capacity: 30, activities: ['yürüyüş', 'piknik'] },
  ],
  'Afyonkarahisar/Sinanpaşa': [
    { id: uid(), name: 'Sinanpaşa Gölet Parkı', emptySlots: 28, lat: 38.7500, lon: 30.2333, type: 'Park', occupancyRate: 20, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Şuhut': [
    { id: uid(), name: 'Şuhut Atatürk Parkı', emptySlots: 18, lat: 38.5333, lon: 30.5500, type: 'Park', occupancyRate: 40, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Afyonkarahisar/Sultandağı': [
    { id: uid(), name: 'Sultandağı Yayla Parkı', emptySlots: 32, lat: 38.5333, lon: 31.2333, type: 'Park', occupancyRate: 15, capacity: 38, activities: ['yürüyüş', 'piknik'] },
  ],

  // ══════════════════════════════════
  // ANKARA
  // ══════════════════════════════════
  'Ankara/Çankaya': [
    { id: uid(), name: 'Kuğulu Park Otopark', emptySlots: 5, lat: 39.9075, lon: 32.8597, type: 'Otopark', occupancyRate: 90, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Botanik Parkı', emptySlots: 30, lat: 39.8900, lon: 32.8100, type: 'Park', occupancyRate: 25, capacity: 40, activities: ['yürüyüş', 'piknik'] },
    { id: uid(), name: 'Seğmenler Parkı', emptySlots: 12, lat: 39.9200, lon: 32.8600, type: 'Park', occupancyRate: 60, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Ankara/Keçiören': [
    { id: uid(), name: 'Estergon Kalesi Otopark', emptySlots: 40, lat: 39.9800, lon: 32.8600, type: 'Otopark', occupancyRate: 20, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Keçiören Şelale Parkı', emptySlots: 18, lat: 39.9750, lon: 32.8550, type: 'Park', occupancyRate: 55, capacity: 40, activities: ['yürüyüş', 'çocuk oyun'] },
  ],
  'Ankara/Yenimahalle': [
    { id: uid(), name: 'Batıkent Metro Otopark', emptySlots: 25, lat: 39.9667, lon: 32.7333, type: 'Otopark', occupancyRate: 45, capacity: 45, activities: ['otopark'] },
    { id: uid(), name: 'ODTÜ Ormanı Girişi', emptySlots: 60, lat: 39.8900, lon: 32.7800, type: 'Park', occupancyRate: 10, capacity: 65, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Mamak': [
    { id: uid(), name: 'Mamak Belediye Parkı', emptySlots: 22, lat: 39.9200, lon: 32.9200, type: 'Park', occupancyRate: 40, capacity: 38, activities: ['yürüyüş', 'çocuk oyun'] },
    { id: uid(), name: 'Kayaş Otopark', emptySlots: 15, lat: 39.9100, lon: 32.9500, type: 'Otopark', occupancyRate: 55, capacity: 35, activities: ['otopark'] },
  ],
  'Ankara/Etimesgut': [
    { id: uid(), name: 'Eryaman Gölet Parkı', emptySlots: 35, lat: 39.9500, lon: 32.6500, type: 'Park', occupancyRate: 20, capacity: 42, activities: ['yürüyüş', 'piknik'] },
    { id: uid(), name: 'Etimesgut AVM Otopark', emptySlots: 50, lat: 39.9400, lon: 32.6700, type: 'Otopark', occupancyRate: 15, capacity: 60, activities: ['otopark'] },
  ],
  'Ankara/Sincan': [
    { id: uid(), name: 'Sincan Lale Parkı', emptySlots: 28, lat: 39.9667, lon: 32.5833, type: 'Park', occupancyRate: 30, capacity: 40, activities: ['yürüyüş'] },
  ],
  'Ankara/Altındağ': [
    { id: uid(), name: 'Ulus Meydanı Otopark', emptySlots: 8, lat: 39.9430, lon: 32.8560, type: 'Otopark', occupancyRate: 80, capacity: 40, activities: ['otopark'] },
    { id: uid(), name: 'Hamamönü Parkı', emptySlots: 20, lat: 39.9350, lon: 32.8700, type: 'Park', occupancyRate: 45, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Ankara/Pursaklar': [
    { id: uid(), name: 'Pursaklar Göl Parkı', emptySlots: 30, lat: 40.0333, lon: 32.9000, type: 'Park', occupancyRate: 25, capacity: 40, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Gölbaşı': [
    { id: uid(), name: 'Mogan Gölü Piknik Alanı', emptySlots: 45, lat: 39.7833, lon: 32.8000, type: 'Piknik Alanı', occupancyRate: 15, capacity: 55, activities: ['piknik', 'yürüyüş'] },
    { id: uid(), name: 'Gölbaşı Sahil Otopark', emptySlots: 20, lat: 39.7900, lon: 32.8100, type: 'Otopark', occupancyRate: 50, capacity: 40, activities: ['otopark'] },
  ],
  'Ankara/Çubuk': [
    { id: uid(), name: 'Çubuk Barajı Parkı', emptySlots: 35, lat: 40.2333, lon: 33.0333, type: 'Park', occupancyRate: 20, capacity: 42, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Akyurt': [
    { id: uid(), name: 'Akyurt Belediye Parkı', emptySlots: 22, lat: 40.1333, lon: 33.0833, type: 'Park', occupancyRate: 30, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Ankara/Ayaş': [
    { id: uid(), name: 'Ayaş Kaplıca Parkı', emptySlots: 28, lat: 40.0167, lon: 32.3333, type: 'Park', occupancyRate: 25, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Ankara/Bala': [
    { id: uid(), name: 'Bala Meydan Parkı', emptySlots: 20, lat: 39.5500, lon: 33.1167, type: 'Park', occupancyRate: 35, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Ankara/Beypazarı': [
    { id: uid(), name: 'Beypazarı Tarihi Otopark', emptySlots: 15, lat: 40.1667, lon: 31.9167, type: 'Otopark', occupancyRate: 60, capacity: 38, activities: ['otopark'] },
    { id: uid(), name: 'İnözü Vadisi Parkı', emptySlots: 40, lat: 40.1700, lon: 31.9000, type: 'Park', occupancyRate: 15, capacity: 48, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Çamlıdere': [
    { id: uid(), name: 'Çamlıdere Göl Parkı', emptySlots: 35, lat: 40.4833, lon: 32.4667, type: 'Park', occupancyRate: 15, capacity: 40, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Elmadağ': [
    { id: uid(), name: 'Elmadağ Kayak Otopark', emptySlots: 30, lat: 39.9167, lon: 33.2333, type: 'Otopark', occupancyRate: 30, capacity: 42, activities: ['otopark'] },
  ],
  'Ankara/Evren': [
    { id: uid(), name: 'Evren Belediye Parkı', emptySlots: 18, lat: 39.0167, lon: 33.8000, type: 'Park', occupancyRate: 35, capacity: 25, activities: ['yürüyüş'] },
  ],
  'Ankara/Güdül': [
    { id: uid(), name: 'Güdül Kanyonu Parkı', emptySlots: 32, lat: 40.2167, lon: 32.2500, type: 'Park', occupancyRate: 20, capacity: 38, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Haymana': [
    { id: uid(), name: 'Haymana Kaplıca Otopark', emptySlots: 25, lat: 39.4333, lon: 32.5000, type: 'Otopark', occupancyRate: 40, capacity: 42, activities: ['otopark'] },
  ],
  'Ankara/Kahramankazan': [
    { id: uid(), name: 'Kazan Millet Bahçesi', emptySlots: 38, lat: 40.1000, lon: 32.6833, type: 'Park', occupancyRate: 20, capacity: 48, activities: ['yürüyüş', 'çocuk oyun'] },
  ],
  'Ankara/Kalecik': [
    { id: uid(), name: 'Kalecik Bağ Yolu Parkı', emptySlots: 22, lat: 40.1000, lon: 33.4167, type: 'Park', occupancyRate: 30, capacity: 30, activities: ['yürüyüş'] },
  ],
  'Ankara/Kızılcahamam': [
    { id: uid(), name: 'Soğuksu Milli Park Otopark', emptySlots: 50, lat: 40.4667, lon: 32.6500, type: 'Otopark', occupancyRate: 10, capacity: 55, activities: ['otopark'] },
    { id: uid(), name: 'Kızılcahamam Termal Parkı', emptySlots: 30, lat: 40.4700, lon: 32.6450, type: 'Park', occupancyRate: 25, capacity: 40, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Nallıhan': [
    { id: uid(), name: 'Nallıhan Kuş Cenneti Parkı', emptySlots: 40, lat: 40.1833, lon: 31.3500, type: 'Park', occupancyRate: 15, capacity: 48, activities: ['yürüyüş', 'piknik'] },
  ],
  'Ankara/Polatlı': [
    { id: uid(), name: 'Gordion Otopark', emptySlots: 30, lat: 39.5833, lon: 32.1500, type: 'Otopark', occupancyRate: 25, capacity: 40, activities: ['otopark'] },
    { id: uid(), name: 'Polatlı Belediye Parkı', emptySlots: 20, lat: 39.5850, lon: 32.1450, type: 'Park', occupancyRate: 40, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Ankara/Şereflikoçhisar': [
    { id: uid(), name: 'Tuz Gölü Parkı', emptySlots: 45, lat: 38.9500, lon: 33.5500, type: 'Park', occupancyRate: 10, capacity: 50, activities: ['yürüyüş'] },
  ],

  // ══════════════════════════════════
  // ANTALYA
  // ══════════════════════════════════
  'Antalya/Muratpaşa': [
    { id: uid(), name: 'Kaleiçi Otopark', emptySlots: 5, lat: 36.8841, lon: 30.7056, type: 'Otopark', occupancyRate: 90, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Karaalioğlu Parkı', emptySlots: 40, lat: 36.8750, lon: 30.7000, type: 'Park', occupancyRate: 15, capacity: 48, activities: ['yürüyüş', 'piknik'] },
    { id: uid(), name: 'Atatürk Parkı Antalya', emptySlots: 20, lat: 36.8800, lon: 30.6950, type: 'Park', occupancyRate: 50, capacity: 40, activities: ['yürüyüş'] },
  ],
  'Antalya/Konyaaltı': [
    { id: uid(), name: 'Konyaaltı Sahil Otopark', emptySlots: 15, lat: 36.8700, lon: 30.6300, type: 'Otopark', occupancyRate: 70, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Beach Park', emptySlots: 35, lat: 36.8650, lon: 30.6250, type: 'Park', occupancyRate: 25, capacity: 45, activities: ['yürüyüş'] },
    { id: uid(), name: 'Atatürk Kültür Parkı', emptySlots: 28, lat: 36.8800, lon: 30.6600, type: 'Park', occupancyRate: 30, capacity: 40, activities: ['yürüyüş', 'çocuk oyun'] },
  ],
  'Antalya/Kepez': [
    { id: uid(), name: 'Kepez Belediye Sosyal Tesisleri', emptySlots: 30, lat: 36.9300, lon: 30.7100, type: 'Park', occupancyRate: 25, capacity: 40, activities: ['yürüyüş', 'piknik'] },
    { id: uid(), name: 'Kepez AVM Otopark', emptySlots: 50, lat: 36.9350, lon: 30.7200, type: 'Otopark', occupancyRate: 15, capacity: 60, activities: ['otopark'] },
  ],
  'Antalya/Alanya': [
    { id: uid(), name: 'Alanya Kalesi Otopark', emptySlots: 10, lat: 36.5322, lon: 32.0000, type: 'Otopark', occupancyRate: 75, capacity: 40, activities: ['otopark'] },
    { id: uid(), name: 'Kleopatra Plajı Parkı', emptySlots: 25, lat: 36.5400, lon: 31.9900, type: 'Park', occupancyRate: 40, capacity: 42, activities: ['yürüyüş'] },
    { id: uid(), name: 'Damlataş Otopark', emptySlots: 8, lat: 36.5350, lon: 31.9950, type: 'Otopark', occupancyRate: 80, capacity: 40, activities: ['otopark'] },
  ],
  'Antalya/Manavgat': [
    { id: uid(), name: 'Manavgat Şelalesi Otopark', emptySlots: 20, lat: 36.8100, lon: 31.4500, type: 'Otopark', occupancyRate: 55, capacity: 45, activities: ['otopark'] },
    { id: uid(), name: 'Side Antik Kent Parkı', emptySlots: 15, lat: 36.7667, lon: 31.3917, type: 'Park', occupancyRate: 60, capacity: 38, activities: ['yürüyüş'] },
  ],
  'Antalya/Kemer': [
    { id: uid(), name: 'Kemer Marina Otopark', emptySlots: 30, lat: 36.5983, lon: 30.5567, type: 'Otopark', occupancyRate: 30, capacity: 42, activities: ['otopark'] },
    { id: uid(), name: 'Yörük Parkı', emptySlots: 22, lat: 36.6000, lon: 30.5600, type: 'Park', occupancyRate: 40, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Antalya/Kaş': [
    { id: uid(), name: 'Kaş Merkez Otopark', emptySlots: 12, lat: 36.2000, lon: 29.6383, type: 'Otopark', occupancyRate: 65, capacity: 35, activities: ['otopark'] },
    { id: uid(), name: 'Antiphellos Parkı', emptySlots: 25, lat: 36.1983, lon: 29.6367, type: 'Park', occupancyRate: 30, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Antalya/Serik': [
    { id: uid(), name: 'Aspendos Otopark', emptySlots: 35, lat: 36.9387, lon: 31.1718, type: 'Otopark', occupancyRate: 20, capacity: 45, activities: ['otopark'] },
  ],
  'Antalya/Aksu': [
    { id: uid(), name: 'Perge Antik Kent Parkı', emptySlots: 28, lat: 36.9600, lon: 30.8500, type: 'Park', occupancyRate: 25, capacity: 38, activities: ['yürüyüş'] },
  ],
  'Antalya/Döşemealtı': [
    { id: uid(), name: 'Döşemealtı Mesire Alanı', emptySlots: 40, lat: 37.0500, lon: 30.5800, type: 'Piknik Alanı', occupancyRate: 15, capacity: 50, activities: ['piknik', 'yürüyüş'] },
  ],
  'Antalya/Akseki': [
    { id: uid(), name: 'Akseki Yörük Yaylası', emptySlots: 30, lat: 37.0500, lon: 31.7833, type: 'Park', occupancyRate: 20, capacity: 35, activities: ['yürüyüş', 'piknik'] },
  ],
  'Antalya/Demre': [
    { id: uid(), name: 'Demre Noel Baba Otopark', emptySlots: 18, lat: 36.2450, lon: 29.9833, type: 'Otopark', occupancyRate: 50, capacity: 35, activities: ['otopark'] },
  ],
  'Antalya/Elmalı': [
    { id: uid(), name: 'Elmalı Göl Parkı', emptySlots: 25, lat: 36.7400, lon: 29.9200, type: 'Park', occupancyRate: 30, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Antalya/Finike': [
    { id: uid(), name: 'Finike Sahil Parkı', emptySlots: 32, lat: 36.2983, lon: 30.1483, type: 'Park', occupancyRate: 20, capacity: 40, activities: ['yürüyüş'] },
  ],
  'Antalya/Gazipaşa': [
    { id: uid(), name: 'Gazipaşa Sahil Otopark', emptySlots: 28, lat: 36.2667, lon: 32.3000, type: 'Otopark', occupancyRate: 25, capacity: 38, activities: ['otopark'] },
  ],
  'Antalya/Gündoğmuş': [
    { id: uid(), name: 'Gündoğmuş Dağ Parkı', emptySlots: 35, lat: 36.8167, lon: 32.0000, type: 'Park', occupancyRate: 15, capacity: 40, activities: ['yürüyüş', 'piknik'] },
  ],
  'Antalya/İbradı': [
    { id: uid(), name: 'İbradı Altınbeşik Otopark', emptySlots: 30, lat: 37.1000, lon: 31.5833, type: 'Otopark', occupancyRate: 20, capacity: 38, activities: ['otopark'] },
  ],
  'Antalya/Korkuteli': [
    { id: uid(), name: 'Korkuteli Belediye Parkı', emptySlots: 22, lat: 37.0667, lon: 30.2000, type: 'Park', occupancyRate: 35, capacity: 32, activities: ['yürüyüş'] },
  ],
  'Antalya/Kumluca': [
    { id: uid(), name: 'Kumluca Portakal Parkı', emptySlots: 28, lat: 36.3667, lon: 30.2833, type: 'Park', occupancyRate: 25, capacity: 35, activities: ['yürüyüş'] },
  ],

  // ══════════════════════════════════
  // GÜMÜŞHANE
  // ══════════════════════════════════
  'Gümüşhane/Merkez': [
    { id: uid(), name: 'Gümüşhane Belediye Parkı', emptySlots: 20, lat: 40.4597, lon: 39.4814, type: 'Park', occupancyRate: 40, capacity: 35, activities: ['yürüyüş'] },
    { id: uid(), name: 'Şehir Merkez Otopark', emptySlots: 15, lat: 40.4580, lon: 39.4800, type: 'Otopark', occupancyRate: 55, capacity: 35, activities: ['otopark'] },
  ],
  'Gümüşhane/Torul': [
    { id: uid(), name: 'Torul Gölü Mesire Alanı', emptySlots: 35, lat: 40.5500, lon: 39.2833, type: 'Piknik Alanı', occupancyRate: 15, capacity: 42, activities: ['piknik', 'yürüyüş'] },
    { id: uid(), name: 'Torul Cam Teras Otopark', emptySlots: 18, lat: 40.5550, lon: 39.2900, type: 'Otopark', occupancyRate: 50, capacity: 35, activities: ['otopark'] },
  ],
  'Gümüşhane/Kelkit': [
    { id: uid(), name: 'Kelkit Çayı Parkı', emptySlots: 25, lat: 40.1167, lon: 39.4333, type: 'Park', occupancyRate: 30, capacity: 35, activities: ['yürüyüş'] },
  ],
  'Gümüşhane/Kürtün': [
    { id: uid(), name: 'Kürtün Orman Parkı', emptySlots: 30, lat: 40.7000, lon: 39.1333, type: 'Park', occupancyRate: 20, capacity: 38, activities: ['yürüyüş', 'piknik'] },
  ],
  'Gümüşhane/Köse': [
    { id: uid(), name: 'Köse Belediye Parkı', emptySlots: 18, lat: 40.2167, lon: 39.6500, type: 'Park', occupancyRate: 35, capacity: 25, activities: ['yürüyüş'] },
  ],
  'Gümüşhane/Şiran': [
    { id: uid(), name: 'Şiran Çam Ormanı Parkı', emptySlots: 28, lat: 40.1833, lon: 39.1167, type: 'Park', occupancyRate: 20, capacity: 35, activities: ['yürüyüş', 'piknik'] },
  ],

  // ══════════════════════════════════
  // BURSA
  // ══════════════════════════════════
  'Bursa/Osmangazi': [
    { id: uid(), name: 'Kültürpark Otopark', emptySlots: 25, lat: 40.1983, lon: 29.0483, type: 'Otopark', occupancyRate: 60, capacity: 62, activities: ['otopark'] },
    { id: uid(), name: 'Reşat Oyal Kültür Parkı', emptySlots: 40, lat: 40.1950, lon: 29.0450, type: 'Park', occupancyRate: 30, capacity: 58, activities: ['yürüyüş', 'piknik', 'çocuk oyun'] },
    { id: uid(), name: 'Tophane Meydanı Otopark', emptySlots: 5, lat: 40.1867, lon: 29.0600, type: 'Otopark', occupancyRate: 90, capacity: 50, activities: ['otopark'] },
  ],
  'Bursa/Nilüfer': [
    { id: uid(), name: 'PodyumPark Otopark', emptySlots: 50, lat: 40.2200, lon: 28.9800, type: 'Otopark', occupancyRate: 40, capacity: 85, activities: ['otopark'] },
    { id: uid(), name: 'Nilüfer Kent Ormanı', emptySlots: 60, lat: 40.1800, lon: 28.9500, type: 'Park', occupancyRate: 15, capacity: 70, activities: ['yürüyüş', 'piknik'] },
  ],
  'Bursa/Yıldırım': [
    { id: uid(), name: 'Kaplıkaya Cazibe Merkezi Otopark', emptySlots: 22, lat: 40.1667, lon: 29.1167, type: 'Otopark', occupancyRate: 50, capacity: 44, activities: ['otopark'] },
  ],
  'Bursa/Mudanya': [
    { id: uid(), name: 'Mudanya Sahil Parkı', emptySlots: 35, lat: 40.3750, lon: 28.8833, type: 'Park', occupancyRate: 25, capacity: 48, activities: ['yürüyüş'] },
  ],

  // ══════════════════════════════════
  // İZMİR
  // ══════════════════════════════════
  'İzmir/Konak': [
    { id: uid(), name: 'Kordon Boyu Otopark', emptySlots: 12, lat: 38.4333, lon: 27.1333, type: 'Otopark', occupancyRate: 70, capacity: 40, activities: ['otopark'] },
    { id: uid(), name: 'Kültürpark İzmir', emptySlots: 55, lat: 38.4300, lon: 27.1433, type: 'Park', occupancyRate: 20, capacity: 70, activities: ['yürüyüş', 'çocuk oyun'] },
    { id: uid(), name: 'Saat Kulesi Otopark', emptySlots: 3, lat: 38.4189, lon: 27.1287, type: 'Otopark', occupancyRate: 95, capacity: 60, activities: ['otopark'] },
  ],
  'İzmir/Bornova': [
    { id: uid(), name: 'Bornova Büyük Park', emptySlots: 28, lat: 38.4633, lon: 27.2167, type: 'Park', occupancyRate: 40, capacity: 48, activities: ['yürüyüş', 'çocuk oyun'] },
    { id: uid(), name: 'Bornova AVM Otopark', emptySlots: 80, lat: 38.4500, lon: 27.2300, type: 'Otopark', occupancyRate: 30, capacity: 115, activities: ['otopark'] },
  ],
  'İzmir/Karşıyaka': [
    { id: uid(), name: 'Karşıyaka Sahil Otopark', emptySlots: 15, lat: 38.4550, lon: 27.1167, type: 'Otopark', occupancyRate: 65, capacity: 42, activities: ['otopark'] },
    { id: uid(), name: 'Mavişehir Doğa Parkı', emptySlots: 45, lat: 38.4833, lon: 27.0833, type: 'Park', occupancyRate: 15, capacity: 52, activities: ['yürüyüş', 'piknik'] },
  ],
  'İzmir/Çeşme': [
    { id: uid(), name: 'Çeşme Marina Otopark', emptySlots: 30, lat: 38.3231, lon: 26.3033, type: 'Otopark', occupancyRate: 40, capacity: 50, activities: ['otopark'] },
    { id: uid(), name: 'Alaçatı Merkez Otopark', emptySlots: 10, lat: 38.2817, lon: 26.3750, type: 'Otopark', occupancyRate: 85, capacity: 65, activities: ['otopark'] },
  ],
};

const COTTAGE_COUNTS = [10, 12, 15, 18, 20, 24, 25, 30];

/**
 * Rastgele ancak tutarlı bir boyut (m²) ve çardak sayısı üretmek için yardımcı fonksiyon.
 * Parkın id'sine göre hep aynı değerleri üretir.
 */
function injectSize(park) {
  if (park.size_sqm && park.cottageCount) return park;
  let hash = 0;
  const strId = String(park.id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // 1500 m² ile 12000 m² arasında bir değer atıyoruz
  const size = park.size_sqm || 1500 + (Math.abs(hash) % 10500);
  const cottageCount = park.cottageCount || COTTAGE_COUNTS[Math.abs(hash) % COTTAGE_COUNTS.length];
  return { ...park, size_sqm: size, cottageCount };
}

/**
 * Şehir ve ilçeye göre dummy parkları getir.
 * Eşleşme bulamazsa boş dizi döner.
 */
export function getDummyParks(city, district) {
  const key = `${city}/${district}`;
  const parks = dummyParksData[key] || [];
  return parks.map(injectSize);
}

/**
 * Tüm dummy parkları tek bir düz dizi olarak döner.
 */
export function getAllDummyParks() {
  return Object.values(dummyParksData).flat().map(injectSize);
}
