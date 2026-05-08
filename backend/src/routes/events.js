const express = require('express');
const router = express.Router();

let events = [
    {
        Id: 1,
        Title: 'Park Temizlik Günü',
        ParkName: 'Gümüşhane Belediye Parkı',
        Date: '2026-05-12',
        Time: '11:00',
        Description: 'Gönüllülerle birlikte park temizliği yapılacaktır.',
        AllowParticipation: true,
        Capacity: 20,
        ParticipantCount: 8,
        Status: 'Aktif',
        CreatedBy: 'Belediye',
        CreatedAt: new Date().toISOString(),
    },
    {
        Id: 2,
        Title: 'Çocuk Oyun Etkinliği',
        ParkName: 'Merkez Park',
        Date: '2026-05-15',
        Time: '14:00',
        Description: 'Çocuklar için oyun ve eğlence etkinliği düzenlenecektir.',
        AllowParticipation: true,
        Capacity: 30,
        ParticipantCount: 12,
        Status: 'Aktif',
        CreatedBy: 'Belediye',
        CreatedAt: new Date().toISOString(),
    },
    {
        Id: 3,
        Title: 'Belediye Konseri',
        ParkName: 'Gümüşhane Belediye Parkı',
        Date: '2026-05-20',
        Time: '19:30',
        Description: 'Park alanında halka açık konser düzenlenecektir. Bu etkinlik sadece duyuru amaçlıdır.',
        AllowParticipation: false,
        Capacity: null,
        ParticipantCount: 0,
        Status: 'Duyuru',
        CreatedBy: 'Belediye',
        CreatedAt: new Date().toISOString(),
    },
];

router.get('/events', (req, res) => {
    res.status(200).json(events);
});

router.post('/events', (req, res) => {
    const {
        Title,
        ParkName,
        Date,
        Time,
        Description,
        AllowParticipation,
        Capacity,
        CreatedBy,
    } = req.body;

    if (!Title || !ParkName || !Date || !Time || !Description) {
        return res.status(400).json({
            success: false,
            message: 'Başlık, park adı, tarih, saat ve açıklama zorunludur.',
        });
    }

    const newEvent = {
        Id: Date.now(),
        Title,
        ParkName,
        Date,
        Time,
        Description,
        AllowParticipation: AllowParticipation === true,
        Capacity: AllowParticipation ? Number(Capacity) || 0 : null,
        ParticipantCount: 0,
        Status: AllowParticipation ? 'Aktif' : 'Duyuru',
        CreatedBy: CreatedBy || 'Yetkili',
        CreatedAt: new Date().toISOString(),
    };

    events.push(newEvent);

    res.status(201).json({
        success: true,
        message: 'Etkinlik başarıyla oluşturuldu.',
        event: newEvent,
    });
});

router.post('/events/:id/join', (req, res) => {
    const id = Number(req.params.id);
    const event = events.find((x) => x.Id === id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: 'Etkinlik bulunamadı.',
        });
    }

    if (!event.AllowParticipation) {
        return res.status(400).json({
            success: false,
            message: 'Bu etkinlik sadece duyuru amaçlıdır. Katılım alınmamaktadır.',
        });
    }

    if (event.ParticipantCount >= event.Capacity) {
        return res.status(400).json({
            success: false,
            message: 'Etkinlik kontenjanı dolmuştur.',
        });
    }

    event.ParticipantCount += 1;

    res.status(200).json({
        success: true,
        message: 'Etkinliğe katılımınız alındı.',
        event,
    });
});

module.exports = router;