const express = require('express');
const { addNotification } = require('./notifications');

const router = express.Router();

let reservations = [];

function getReservations() {
  return reservations;
}

router.get('/reservations', async (req, res) => {
  try {
    const userId = req.query.userId
      ? parseInt(req.query.userId, 10)
      : null;
    let list = reservations;
    if (userId) {
      list = reservations.filter((r) => r.UserId === userId);
    }
    res.status(200).json(list);
  } catch (error) {
    console.error('Rezervasyonlar çekilirken hata:', error);
    res.status(500).send('Sunucu Hatası');
  }
});

router.post('/reservations', async (req, res) => {
  try {
    const { UserId, PicnicAreaId, ParkName, StartTime, EndTime, Status } =
      req.body;

    if (!PicnicAreaId || !StartTime || !EndTime) {
      return res.status(400).json({
        success: false,
        message: 'Eksik alan. Başlangıç ve bitiş zamanı zorunludur.',
      });
    }

    const start = new Date(StartTime);
    const end = new Date(EndTime);
    const now = new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tarih veya saat formatı.',
      });
    }

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: 'Başlangıç tarihi ve saati geçmişte olamaz.',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Bitiş saati, başlangıç saatinden sonra olmalıdır.',
      });
    }

    const userId = UserId ? parseInt(UserId, 10) : 1;

    const newReservation = {
      id: Date.now(),
      UserId: userId,
      PicnicAreaId,
      ParkName: ParkName || 'Park adı yok',
      StartTime,
      EndTime,
      Status: Status || 'Onaylandı',
      CreatedAt: new Date().toISOString(),
    };

    reservations.push(newReservation);

    addNotification({
      userId: userId,
      type: 'reservation',
      title: 'Rezervasyon Oluşturuldu',
      message: `${ParkName} için rezervasyonunuz başarıyla kaydedildi. Detayları Rezervasyonlarım sayfasından görebilirsiniz.`,
    });

    res.status(200).json({
      success: true,
      message: 'Rezervasyon oluşturuldu.',
      reservation: newReservation,
    });
  } catch (error) {
    console.error('Rezervasyon kaydedilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası.',
    });
  }
});

module.exports = router;
module.exports.getReservations = getReservations;
