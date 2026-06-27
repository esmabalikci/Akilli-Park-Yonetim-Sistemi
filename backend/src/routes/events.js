const express = require('express');
const { getPool, dbNotConfigured, toIso, sql, config } = require('../utils/dbHelpers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function mapEventRow(row) {
  return {
    Id: row.Id,
    Title: row.Title,
    ParkName: row.ParkName,
    Date: row.EventDate,
    Time: row.EventTime,
    Description: row.Description,
    AllowParticipation: Boolean(row.AllowParticipation),
    Capacity: row.Capacity,
    ParticipantCount: row.ParticipantCount,
    Status: row.Status,
    CreatedBy: row.CreatedBy,
    CreatedAt: toIso(row.CreatedAt),
  };
}

router.get('/events', async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id, Title, ParkName, EventDate, EventTime, Description,
             AllowParticipation, Capacity, ParticipantCount, Status, CreatedBy, CreatedAt
      FROM Events
      ORDER BY EventDate ASC, EventTime ASC
    `);

    res.status(200).json(result.recordset.map(mapEventRow));
  } catch (error) {
    console.error('Etkinlikler çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/events', async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

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

    const allowParticipation = AllowParticipation === true;
    const capacity = allowParticipation ? Number(Capacity) || 0 : null;
    const status = allowParticipation ? 'Aktif' : 'Duyuru';

    const pool = await getPool();
    const result = await pool
      .request()
      .input('Title', sql.NVarChar, Title)
      .input('ParkName', sql.NVarChar, ParkName)
      .input('EventDate', sql.NVarChar, Date)
      .input('EventTime', sql.NVarChar, Time)
      .input('Description', sql.NVarChar, Description)
      .input('AllowParticipation', sql.Bit, allowParticipation)
      .input('Capacity', sql.Int, capacity)
      .input('Status', sql.NVarChar, status)
      .input('CreatedBy', sql.NVarChar, CreatedBy || 'Yetkili')
      .query(`
        INSERT INTO Events (
          Title, ParkName, EventDate, EventTime, Description,
          AllowParticipation, Capacity, ParticipantCount, Status, CreatedBy
        )
        OUTPUT INSERTED.Id, INSERTED.Title, INSERTED.ParkName, INSERTED.EventDate,
               INSERTED.EventTime, INSERTED.Description, INSERTED.AllowParticipation,
               INSERTED.Capacity, INSERTED.ParticipantCount, INSERTED.Status,
               INSERTED.CreatedBy, INSERTED.CreatedAt
        VALUES (
          @Title, @ParkName, @EventDate, @EventTime, @Description,
          @AllowParticipation, @Capacity, 0, @Status, @CreatedBy
        )
      `);

    const newEvent = mapEventRow(result.recordset[0]);

    res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu.',
      event: newEvent,
    });
  } catch (error) {
    console.error('Etkinlik oluşturulurken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/events/:id/join', authenticate, async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz etkinlik kimliği.',
      });
    }

    const pool = await getPool();
    const existing = await pool
      .request()
      .input('Id', sql.Int, id)
      .query(`
        SELECT Id, Title, ParkName, EventDate, EventTime, Description,
               AllowParticipation, Capacity, ParticipantCount, Status, CreatedBy, CreatedAt
        FROM Events WHERE Id = @Id
      `);

    const event = existing.recordset[0];
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

    const updated = await pool
      .request()
      .input('Id', sql.Int, id)
      .query(`
        UPDATE Events
        SET ParticipantCount = ParticipantCount + 1
        OUTPUT INSERTED.Id, INSERTED.Title, INSERTED.ParkName, INSERTED.EventDate,
               INSERTED.EventTime, INSERTED.Description, INSERTED.AllowParticipation,
               INSERTED.Capacity, INSERTED.ParticipantCount, INSERTED.Status,
               INSERTED.CreatedBy, INSERTED.CreatedAt
        WHERE Id = @Id
      `);

    res.status(200).json({
      success: true,
      message: 'Etkinliğe katılımınız alındı.',
      event: mapEventRow(updated.recordset[0]),
    });
  } catch (error) {
    console.error('Etkinliğe katılım hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
