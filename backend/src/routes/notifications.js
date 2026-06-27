const express = require('express');
const { getPool, dbNotConfigured, toIso, sql, config } = require('../utils/dbHelpers');
const { sendExpoPush } = require('../services/pushService');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

function turkeyDateKey(isoOrDate) {
  const date = new Date(isoOrDate);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function turkeyTimeLabel(isoOrDate) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoOrDate));
}

function mapNotificationRow(row) {
  return {
    id: row.Id,
    userId: row.UserId,
    type: row.Type,
    title: row.Title,
    message: row.Message,
    read: Boolean(row.IsRead),
    createdAt: toIso(row.CreatedAt),
  };
}

/** Rezervasyon günü geldiğinde gösterilecek bildirimler (dinamik, DB'ye yazılmaz) */
async function buildUpcomingReservationNotifications(userId) {
  if (!userId) return [];

  const { getReservationsFromDb } = require('./reservations');
  const todayKey = turkeyDateKey(new Date());
  const now = new Date();

  const reservations = await getReservationsFromDb(userId);

  return reservations
    .filter((r) => turkeyDateKey(r.StartTime) === todayKey)
    .filter((r) => new Date(r.EndTime) > now)
    .map((r) => ({
      id: `upcoming-${r.id}`,
      userId,
      type: 'upcoming',
      title: 'Yaklaşan bir etkinliğiniz var',
      message: `${r.ParkName} rezervasyonunuz bugün ${turkeyTimeLabel(r.StartTime)} saatinde başlıyor.`,
      read: false,
      createdAt: new Date().toISOString(),
      reservationId: r.id,
    }));
}

async function addNotification({ userId, type, title, message }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('UserId', sql.Int, userId ?? null)
    .input('Type', sql.NVarChar, type || 'system')
    .input('Title', sql.NVarChar, title)
    .input('Message', sql.NVarChar, message)
    .query(`
      INSERT INTO Notifications (UserId, Type, Title, Message, IsRead)
      OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.Type, INSERTED.Title,
             INSERTED.Message, INSERTED.IsRead, INSERTED.CreatedAt
      VALUES (@UserId, @Type, @Title, @Message, 0)
    `);

  const row = mapNotificationRow(result.recordset[0]);

  if (userId) {
    sendExpoPush(userId, { title, message, data: { type: type || 'system' } });
  }

  return row;
}

router.get('/notifications', optionalAuth, async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const userId = req.user?.userId
      ?? (req.query.userId ? parseInt(req.query.userId, 10) : null);
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT Id, UserId, Type, Title, Message, IsRead, CreatedAt
      FROM Notifications
    `;

    if (userId) {
      request.input('UserId', sql.Int, userId);
      query += ' WHERE UserId IS NULL OR UserId = @UserId';
    }

    query += ' ORDER BY CreatedAt DESC';

    const result = await request.query(query);
    const stored = result.recordset.map(mapNotificationRow);
    const upcoming = userId ? await buildUpcomingReservationNotifications(userId) : [];
    const merged = [...upcoming, ...stored];

    merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(merged);
  } catch (error) {
    console.error('Bildirimler çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.patch('/notifications/:id/read', optionalAuth, async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const rawId = req.params.id;

    if (String(rawId).startsWith('upcoming-')) {
      return res.json({ success: true });
    }

    const id = parseInt(rawId, 10);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('Id', sql.Int, id)
      .query(`
        UPDATE Notifications
        SET IsRead = 1
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.Type, INSERTED.Title,
               INSERTED.Message, INSERTED.IsRead, INSERTED.CreatedAt
        WHERE Id = @Id
      `);

    if (!result.recordset[0]) {
      return res.status(404).json({ success: false, message: 'Bildirim bulunamadı.' });
    }

    res.json({ success: true, notification: mapNotificationRow(result.recordset[0]) });
  } catch (error) {
    console.error('Bildirim okundu işaretlenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = { router, addNotification };
