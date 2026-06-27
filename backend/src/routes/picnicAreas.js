const express = require('express');
const { getPool, sql, config, dbNotConfigured } = require('../utils/dbHelpers');
const { optionalAuth } = require('../middleware/auth');
const {
  getCottageAvailability,
  hasReservationConflict,
} = require('../services/reservationConflict');

const router = express.Router();

router.get('/picnic-areas/availability', optionalAuth, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const { parkOsmId, cottageName, startTime, endTime } = req.query;

    if (!parkOsmId || !cottageName || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'parkOsmId, cottageName, startTime, endTime zorunludur.',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const availability = await getCottageAvailability({
      parkOsmId: String(parkOsmId),
      cottageName: String(cottageName),
      startTime: start,
      endTime: end,
    });

    res.json({ success: true, ...availability });
  } catch (error) {
    console.error('Müsaitlik kontrolü hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.get('/picnic-areas/:parkOsmId', optionalAuth, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const parkOsmId = decodeURIComponent(req.params.parkOsmId);
    const cottageCount = parseInt(req.query.count || '20', 10);
    const startTime = req.query.startTime ? new Date(req.query.startTime) : null;
    const endTime = req.query.endTime ? new Date(req.query.endTime) : null;

    const cottages = [];
    for (let i = 1; i <= cottageCount; i += 1) {
      const cottageName = `${i} Numaralı Çardak`;
      let available = true;

      if (startTime && endTime && !Number.isNaN(startTime) && !Number.isNaN(endTime)) {
        available = !(await hasReservationConflict({
          parkOsmId,
          cottageName,
          startTime,
          endTime,
        }));
      }

      cottages.push({ id: i, name: cottageName, available });
    }

    res.json({ success: true, parkOsmId, cottages });
  } catch (error) {
    console.error('Çardak listesi hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
