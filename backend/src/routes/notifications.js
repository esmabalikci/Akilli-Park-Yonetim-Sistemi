const express = require('express');

const router = express.Router();

let notifications = [
  {
    id: 1,
    userId: null,
    type: 'system',
    title: 'Hoş geldiniz',
    message: 'Akıllı Piknik Alanı Yönetim Sistemine hoş geldiniz.',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

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

/** Rezervasyon günü geldiğinde gösterilecek bildirimler */
function buildUpcomingReservationNotifications(userId) {
  if (!userId) return [];

  const { getReservations } = require('./reservations');
  const todayKey = turkeyDateKey(new Date());
  const now = new Date();

  return getReservations()
    .filter((r) => r.UserId === userId)
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

function addNotification({ userId, type, title, message }) {
  const entry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    userId: userId ?? null,
    type: type || 'system',
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(entry);
  return entry;
}

router.get('/notifications', (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;

  let stored = notifications;
  if (userId) {
    stored = notifications.filter(
      (n) => n.userId === null || n.userId === userId
    );
  }

  const upcoming = userId ? buildUpcomingReservationNotifications(userId) : [];
  const merged = [...upcoming, ...stored];

  merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json(merged);
});

router.patch('/notifications/:id/read', (req, res) => {
  const rawId = req.params.id;

  if (String(rawId).startsWith('upcoming-')) {
    return res.json({ success: true });
  }

  const id = parseInt(rawId, 10);
  const item = notifications.find((n) => n.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Bildirim bulunamadı.' });
  }
  item.read = true;
  res.json({ success: true, notification: item });
});

module.exports = { router, addNotification };
