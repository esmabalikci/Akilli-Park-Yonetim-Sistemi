const express = require('express');
const { addNotification } = require('./notifications');
const { getPool, dbNotConfigured, toIso, sql, config } = require('../utils/dbHelpers');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  hasReservationConflict,
  ensurePicnicAreaForCottage,
} = require('../services/reservationConflict');

const router = express.Router();
const RESERVATION_FEE_TRY = Number(process.env.RESERVATION_FEE_TRY || 50);

function mapReservationRow(row) {
  return {
    id: row.Id,
    Id: row.Id,
    UserId: row.UserId,
    PicnicAreaId: row.PicnicAreaId,
    ParkOsmId: row.ParkOsmId,
    ParkName: row.ParkName,
    CottageName: row.CottageName,
    StartTime: toIso(row.StartTime),
    EndTime: toIso(row.EndTime),
    Status: row.Status,
    PaymentId: row.PaymentId,
    CreatedAt: toIso(row.CreatedAt),
  };
}

async function getReservationsFromDb(userId = null) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT Id, UserId, PicnicAreaId, ParkOsmId, ParkName, CottageName,
           StartTime, EndTime, Status, PaymentId, CreatedAt
    FROM Reservations
  `;

  if (userId) {
    request.input('UserId', sql.Int, userId);
    query += ' WHERE UserId = @UserId';
  }

  query += ' ORDER BY CreatedAt DESC';

  const result = await request.query(query);
  return result.recordset.map(mapReservationRow);
}

function parseParkReference(picnicAreaId) {
  if (picnicAreaId == null || picnicAreaId === '') {
    return { picnicAreaId: null, parkOsmId: null };
  }

  const asString = String(picnicAreaId);
  const asInt = parseInt(asString, 10);

  if (Number.isFinite(asInt) && String(asInt) === asString) {
    return { picnicAreaId: asInt, parkOsmId: null };
  }

  return { picnicAreaId: null, parkOsmId: asString };
}

async function processPayment(pool, userId, paymentMethodId, reservationId, amount) {
  const method = await pool
    .request()
    .input('Id', sql.Int, parseInt(paymentMethodId, 10))
    .input('UserId', sql.Int, userId)
    .query('SELECT Id FROM PaymentMethods WHERE Id = @Id AND UserId = @UserId');

  if (!method.recordset[0]) {
    throw new Error('Ödeme yöntemi bulunamadı.');
  }

  const payment = await pool
    .request()
    .input('UserId', sql.Int, userId)
    .input('ReservationId', sql.Int, reservationId)
    .input('Amount', sql.Decimal(10, 2), amount)
    .input('PaymentMethodId', sql.Int, parseInt(paymentMethodId, 10))
    .query(`
      INSERT INTO Payments (UserId, ReservationId, Amount, Currency, Status, PaymentMethodId, Description)
      OUTPUT INSERTED.Id
      VALUES (@UserId, @ReservationId, @Amount, 'TRY', 'completed', @PaymentMethodId, N'Rezervasyon ücreti')
    `);

  return payment.recordset[0].Id;
}

router.get('/reservations', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const userId =
      req.user.role === 'Admin' && req.query.userId
        ? parseInt(req.query.userId, 10)
        : req.user.userId;

    const list = await getReservationsFromDb(userId);
    res.status(200).json(list);
  } catch (error) {
    console.error('Rezervasyonlar çekilirken hata:', error);
    res.status(500).send('Sunucu Hatası');
  }
});

router.post('/reservations', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const {
      PicnicAreaId,
      ParkName,
      CottageName,
      StartTime,
      EndTime,
      Status,
      PaymentMethodId,
      SkipPayment,
    } = req.body;

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

    const userId = req.user.userId;
    const pool = await getPool();
    const parkRef = parseParkReference(PicnicAreaId);
    const resolvedParkName = ParkName || 'Park adı yok';
    const parkOsmId = parkRef.parkOsmId || null;

    const conflict = await hasReservationConflict({
      parkOsmId,
      picnicAreaId: parkRef.picnicAreaId,
      cottageName: CottageName || null,
      startTime: start,
      endTime: end,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: CottageName
          ? `${CottageName} seçilen saat aralığında dolu. Lütfen farklı saat veya çardak seçin.`
          : 'Seçilen saat aralığında bu alan için başka bir rezervasyon var.',
      });
    }

    let picnicAreaId = parkRef.picnicAreaId;
    if (CottageName && parkOsmId) {
      picnicAreaId = await ensurePicnicAreaForCottage({
        parkOsmId,
        parkName: resolvedParkName,
        cottageName: CottageName,
      });
    }

    const status = Status || 'Onaylandı';

    const insertResult = await pool
      .request()
      .input('UserId', sql.Int, userId)
      .input('PicnicAreaId', sql.Int, picnicAreaId)
      .input('ParkOsmId', sql.NVarChar, parkOsmId)
      .input('ParkName', sql.NVarChar, resolvedParkName)
      .input('CottageName', sql.NVarChar, CottageName || null)
      .input('StartTime', sql.DateTime2, start)
      .input('EndTime', sql.DateTime2, end)
      .input('Status', sql.NVarChar, status)
      .query(`
        INSERT INTO Reservations (
          UserId, PicnicAreaId, ParkOsmId, ParkName, CottageName,
          StartTime, EndTime, Status
        )
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.PicnicAreaId, INSERTED.ParkOsmId,
               INSERTED.ParkName, INSERTED.CottageName, INSERTED.StartTime, INSERTED.EndTime,
               INSERTED.Status, INSERTED.PaymentId, INSERTED.CreatedAt
        VALUES (
          @UserId, @PicnicAreaId, @ParkOsmId, @ParkName, @CottageName,
          @StartTime, @EndTime, @Status
        )
      `);

    const newReservation = mapReservationRow(insertResult.recordset[0]);

    if (PaymentMethodId && !SkipPayment) {
      try {
        const paymentId = await processPayment(
          pool,
          userId,
          PaymentMethodId,
          newReservation.id,
          RESERVATION_FEE_TRY
        );
        await pool
          .request()
          .input('PaymentId', sql.Int, paymentId)
          .input('Id', sql.Int, newReservation.id)
          .query('UPDATE Reservations SET PaymentId = @PaymentId WHERE Id = @Id');
        newReservation.paymentId = paymentId;
      } catch (payErr) {
        await pool
          .request()
          .input('Id', sql.Int, newReservation.id)
          .query('DELETE FROM Reservations WHERE Id = @Id');
        return res.status(402).json({
          success: false,
          message: payErr.message || 'Ödeme alınamadı, rezervasyon iptal edildi.',
        });
      }
    }

    await addNotification({
      userId,
      type: 'reservation',
      title: 'Rezervasyon Oluşturuldu',
      message: `${resolvedParkName} için rezervasyonunuz başarıyla kaydedildi.`,
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
module.exports.getReservationsFromDb = getReservationsFromDb;
