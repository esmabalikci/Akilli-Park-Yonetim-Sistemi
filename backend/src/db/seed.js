const { getPool, sql } = require('../utils/dbHelpers');

const DEFAULT_EVENTS = [
  {
    Title: 'Park Temizlik Günü',
    ParkName: 'Gümüşhane Belediye Parkı',
    EventDate: '2026-05-12',
    EventTime: '11:00',
    Description: 'Gönüllülerle birlikte park temizliği yapılacaktır.',
    AllowParticipation: true,
    Capacity: 20,
    ParticipantCount: 8,
    Status: 'Aktif',
    CreatedBy: 'Belediye',
  },
  {
    Title: 'Çocuk Oyun Etkinliği',
    ParkName: 'Merkez Park',
    EventDate: '2026-05-15',
    EventTime: '14:00',
    Description: 'Çocuklar için oyun ve eğlence etkinliği düzenlenecektir.',
    AllowParticipation: true,
    Capacity: 30,
    ParticipantCount: 12,
    Status: 'Aktif',
    CreatedBy: 'Belediye',
  },
  {
    Title: 'Belediye Konseri',
    ParkName: 'Gümüşhane Belediye Parkı',
    EventDate: '2026-05-20',
    EventTime: '19:30',
    Description:
      'Park alanında halka açık konser düzenlenecektir. Bu etkinlik sadece duyuru amaçlıdır.',
    AllowParticipation: false,
    Capacity: null,
    ParticipantCount: 0,
    Status: 'Duyuru',
    CreatedBy: 'Belediye',
  },
];

async function seedIfEmpty() {
  const pool = await getPool();

  const eventsCount = await pool
    .request()
    .query('SELECT COUNT(*) AS cnt FROM Events');
  if (eventsCount.recordset[0].cnt === 0) {
    for (const event of DEFAULT_EVENTS) {
      await pool
        .request()
        .input('Title', sql.NVarChar, event.Title)
        .input('ParkName', sql.NVarChar, event.ParkName)
        .input('EventDate', sql.NVarChar, event.EventDate)
        .input('EventTime', sql.NVarChar, event.EventTime)
        .input('Description', sql.NVarChar, event.Description)
        .input('AllowParticipation', sql.Bit, event.AllowParticipation)
        .input('Capacity', sql.Int, event.Capacity)
        .input('ParticipantCount', sql.Int, event.ParticipantCount)
        .input('Status', sql.NVarChar, event.Status)
        .input('CreatedBy', sql.NVarChar, event.CreatedBy)
        .query(`
          INSERT INTO Events (
            Title, ParkName, EventDate, EventTime, Description,
            AllowParticipation, Capacity, ParticipantCount, Status, CreatedBy
          ) VALUES (
            @Title, @ParkName, @EventDate, @EventTime, @Description,
            @AllowParticipation, @Capacity, @ParticipantCount, @Status, @CreatedBy
          )
        `);
    }
    console.log('Örnek etkinlikler veritabanına eklendi.');
  }

  const notifCount = await pool
    .request()
    .query('SELECT COUNT(*) AS cnt FROM Notifications');
  if (notifCount.recordset[0].cnt === 0) {
    await pool
      .request()
      .input('Title', sql.NVarChar, 'Hoş geldiniz')
      .input('Message', sql.NVarChar, 'Akıllı Piknik Alanı Yönetim Sistemine hoş geldiniz.')
      .query(`
        INSERT INTO Notifications (UserId, Type, Title, Message, IsRead)
        VALUES (NULL, 'system', @Title, @Message, 0)
      `);
    console.log('Varsayılan bildirim veritabanına eklendi.');
  }
}

module.exports = { seedIfEmpty };
