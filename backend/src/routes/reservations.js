const express = require('express');
const router = express.Router();

router.get('/reservations', async (req, res) => {
    try {
        res.status(200).json([]);
    } catch (error) {
        console.error('Rezervasyonlar çekilirken hata:', error);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/reservations', async (req, res) => {
    try {
        const { UserId, PicnicAreaId, StartTime, EndTime, Status } = req.body;

        if (!PicnicAreaId || !StartTime || !EndTime) {
            return res.status(400).send('Eksik alan.');
        }

        res.status(200).json({
            message: 'Rezervasyon başarıyla oluşturuldu.',
            receivedData: req.body,
        });
    } catch (error) {
        console.error('Rezervasyon kaydedilirken hata:', error);
        res.status(500).send('Veritabanı kayıt hatası.');
    }
});

module.exports = router;