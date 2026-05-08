const express = require('express');
const router = express.Router();

let reservations = [];

router.get('/reservations', async (req, res) => {
    try {
        res.status(200).json(reservations);
    } catch (error) {
        console.error('Rezervasyonlar çekilirken hata:', error);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/reservations', async (req, res) => {
    try {
        const { UserId, PicnicAreaId, ParkName, StartTime, EndTime, Status } = req.body;

        if (!PicnicAreaId || !StartTime || !EndTime) {
            return res.status(400).send('Eksik alan.');
        }

        const newReservation = {
            id: Date.now(),
            UserId: UserId || 1,
            PicnicAreaId,
            ParkName: ParkName || 'Park adı yok',
            StartTime,
            EndTime,
            Status: Status || 'Onaylandı',
        };

        reservations.push(newReservation);

        res.status(200).json({
            success: true,
            message: 'Rezervasyon başarıyla oluşturuldu.',
            reservation: newReservation,
        });
    } catch (error) {
        console.error('Rezervasyon kaydedilirken hata:', error);
        res.status(500).send('Veritabanı kayıt hatası.');
    }
});

module.exports = router;