const express = require('express');
const router = express.Router();

let lostFoundItems = [];

router.get('/lost-found', (req, res) => {
    res.status(200).json(lostFoundItems);
});

router.post('/lost-found', (req, res) => {
    const {
        UserId,
        Type,
        ItemName,
        Description,
        ParkName,
        ContactInfo,
        Status,
    } = req.body;

    if (!Type || !ItemName || !Description || !ParkName) {
        return res.status(400).json({
            success: false,
            message: 'Tür, eşya adı, açıklama ve park adı zorunludur.',
        });
    }

    const newItem = {
        Id: Date.now(),
        UserId: UserId || 1,
        Type,
        ItemName,
        Description,
        ParkName,
        ContactInfo: ContactInfo || 'İletişim bilgisi yok',
        Status: Status || 'Açık',
        CreatedAt: new Date().toISOString(),
    };

    lostFoundItems.push(newItem);

    res.status(201).json({
        success: true,
        message: 'İlan başarıyla oluşturuldu.',
        item: newItem,
    });
});

router.put('/lost-found/:id/status', (req, res) => {
    const id = Number(req.params.id);
    const { Status } = req.body;

    const item = lostFoundItems.find((x) => x.Id === id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'İlan bulunamadı.',
        });
    }

    item.Status = Status || 'Kapalı';

    res.status(200).json({
        success: true,
        message: 'İlan durumu güncellendi.',
        item,
    });
});

module.exports = router;