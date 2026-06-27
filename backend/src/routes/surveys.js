const express = require('express');
const { getPool, dbNotConfigured, toIso, sql, config } = require('../utils/dbHelpers');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function mapSurveyRow(row) {
  return {
    id: row.Id,
    userId: row.UserId,
    userName: row.FullName || 'Kullanıcı',
    parkOsmId: row.ParkOsmId,
    parkName: row.ParkName,
    rating: row.Rating,
    text: row.Comments || '',
    reservationId: row.ReservationId,
    sourceType: row.SourceType || 'park',
    createdAt: toIso(row.CreatedAt),
    updatedAt: row.UpdatedAt ? toIso(row.UpdatedAt) : null,
  };
}

function computeStats(reviews) {
  if (!reviews.length) {
    return { averageRating: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    const rating = r.rating || r.Rating;
    if (rating >= 1 && rating <= 5) {
      sum += rating;
      distribution[rating] += 1;
    }
  }
  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
    distribution,
  };
}

const SELECT_SURVEY = `
  SELECT s.Id, s.UserId, s.ReservationId, s.ParkOsmId, s.ParkName,
         s.Rating, s.Comments, s.SourceType, s.CreatedAt, s.UpdatedAt,
         u.FullName
  FROM Surveys s
  LEFT JOIN Users u ON u.Id = s.UserId
`;

router.get('/surveys/park/:parkKey', async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const parkKey = decodeURIComponent(req.params.parkKey);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('ParkOsmId', sql.NVarChar, parkKey)
      .query(`
        ${SELECT_SURVEY}
        WHERE s.ParkOsmId = @ParkOsmId AND s.SourceType = 'park'
        ORDER BY s.CreatedAt DESC
      `);

    const reviews = result.recordset.map(mapSurveyRow);
    res.json({
      success: true,
      reviews,
      stats: computeStats(reviews),
    });
  } catch (error) {
    console.error('Park değerlendirmeleri çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.get('/surveys/user/:userId', async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const userId = parseInt(req.params.userId, 10);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('UserId', sql.Int, userId)
      .query(`
        ${SELECT_SURVEY}
        WHERE s.UserId = @UserId
        ORDER BY s.CreatedAt DESC
      `);

    res.json({
      success: true,
      reviews: result.recordset.map(mapSurveyRow),
    });
  } catch (error) {
    console.error('Kullanıcı değerlendirmeleri çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.get('/surveys/pending-reservation', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const userId = req.user.userId;

    const pool = await getPool();
    const result = await pool.request().input('UserId', sql.Int, userId).query(`
      SELECT r.Id, r.ParkName, r.ParkOsmId, r.StartTime, r.EndTime, r.CottageName
      FROM Reservations r
      WHERE r.UserId = @UserId
        AND r.EndTime < GETDATE()
        AND NOT EXISTS (
          SELECT 1 FROM Surveys s
          WHERE s.ReservationId = r.Id AND s.UserId = @UserId
        )
      ORDER BY r.EndTime DESC
    `);

    const pending = result.recordset.map((r) => ({
      reservationId: r.Id,
      parkName: r.ParkName,
      parkOsmId: r.ParkOsmId,
      cottageName: r.CottageName,
      startTime: toIso(r.StartTime),
      endTime: toIso(r.EndTime),
    }));

    res.json({ success: true, pending });
  } catch (error) {
    console.error('Bekleyen anketler çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/surveys', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const {
      ParkOsmId,
      ParkName,
      Rating,
      Comments,
      ReservationId,
      SourceType,
    } = req.body;

    const userId = req.user.userId;
    const rating = parseInt(Rating, 10);

    if (!userId || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli kullanıcı ve 1–5 arası puan zorunludur.',
      });
    }

    const pool = await getPool();
    const reservationId = ReservationId ? parseInt(ReservationId, 10) : null;
    const sourceType = reservationId ? 'reservation' : SourceType || 'park';
    const parkOsmId = ParkOsmId ? String(ParkOsmId) : null;
    const parkName = ParkName || 'Park';
    const comments = Comments?.trim() || null;

    if (sourceType === 'park' && !parkOsmId) {
      return res.status(400).json({
        success: false,
        message: 'Park kimliği zorunludur.',
      });
    }

    if (reservationId) {
      const existing = await pool
        .request()
        .input('UserId', sql.Int, userId)
        .input('ReservationId', sql.Int, reservationId)
        .query(
          'SELECT Id FROM Surveys WHERE UserId = @UserId AND ReservationId = @ReservationId'
        );

      if (existing.recordset[0]) {
        const updated = await pool
          .request()
          .input('Id', sql.Int, existing.recordset[0].Id)
          .input('Rating', sql.Int, rating)
          .input('Comments', sql.NVarChar, comments)
          .query(`
            UPDATE Surveys
            SET Rating = @Rating, Comments = @Comments, UpdatedAt = GETDATE()
            OUTPUT INSERTED.Id
            WHERE Id = @Id
          `);

        const row = await pool
          .request()
          .input('Id', sql.Int, updated.recordset[0].Id)
          .query(`${SELECT_SURVEY} WHERE s.Id = @Id`);

        return res.json({
          success: true,
          message: 'Değerlendirmeniz güncellendi.',
          review: mapSurveyRow(row.recordset[0]),
        });
      }

      const resRow = await pool
        .request()
        .input('ReservationId', sql.Int, reservationId)
        .query(
          'SELECT ParkName, ParkOsmId FROM Reservations WHERE Id = @ReservationId'
        );
      const reservation = resRow.recordset[0];
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Rezervasyon bulunamadı.',
        });
      }

      const insertResult = await pool
        .request()
        .input('UserId', sql.Int, userId)
        .input('ReservationId', sql.Int, reservationId)
        .input('ParkOsmId', sql.NVarChar, reservation.ParkOsmId || parkOsmId)
        .input('ParkName', sql.NVarChar, reservation.ParkName || parkName)
        .input('Rating', sql.Int, rating)
        .input('Comments', sql.NVarChar, comments)
        .input('SourceType', sql.NVarChar, 'reservation')
        .query(`
          INSERT INTO Surveys (
            UserId, ReservationId, ParkOsmId, ParkName, Rating, Comments, SourceType
          )
          OUTPUT INSERTED.Id
          VALUES (
            @UserId, @ReservationId, @ParkOsmId, @ParkName, @Rating, @Comments, @SourceType
          )
        `);

      const row = await pool
        .request()
        .input('Id', sql.Int, insertResult.recordset[0].Id)
        .query(`${SELECT_SURVEY} WHERE s.Id = @Id`);

      return res.status(201).json({
        success: true,
        message: 'Rezervasyon değerlendirmeniz kaydedildi. Teşekkürler!',
        review: mapSurveyRow(row.recordset[0]),
      });
    }

    const existingPark = await pool
      .request()
      .input('UserId', sql.Int, userId)
      .input('ParkOsmId', sql.NVarChar, parkOsmId)
      .query(`
        SELECT Id FROM Surveys
        WHERE UserId = @UserId AND ParkOsmId = @ParkOsmId
          AND SourceType = 'park' AND ReservationId IS NULL
      `);

    if (existingPark.recordset[0]) {
      const updated = await pool
        .request()
        .input('Id', sql.Int, existingPark.recordset[0].Id)
        .input('Rating', sql.Int, rating)
        .input('Comments', sql.NVarChar, comments)
        .input('ParkName', sql.NVarChar, parkName)
        .query(`
          UPDATE Surveys
          SET Rating = @Rating, Comments = @Comments, ParkName = @ParkName,
              UpdatedAt = GETDATE()
          OUTPUT INSERTED.Id
          WHERE Id = @Id
        `);

      const row = await pool
        .request()
        .input('Id', sql.Int, updated.recordset[0].Id)
        .query(`${SELECT_SURVEY} WHERE s.Id = @Id`);

      return res.json({
        success: true,
        message: 'Değerlendirmeniz güncellendi.',
        review: mapSurveyRow(row.recordset[0]),
      });
    }

    const insertResult = await pool
      .request()
      .input('UserId', sql.Int, userId)
      .input('ParkOsmId', sql.NVarChar, parkOsmId)
      .input('ParkName', sql.NVarChar, parkName)
      .input('Rating', sql.Int, rating)
      .input('Comments', sql.NVarChar, comments)
      .input('SourceType', sql.NVarChar, 'park')
      .query(`
        INSERT INTO Surveys (
          UserId, ParkOsmId, ParkName, Rating, Comments, SourceType
        )
        OUTPUT INSERTED.Id
        VALUES (
          @UserId, @ParkOsmId, @ParkName, @Rating, @Comments, @SourceType
        )
      `);

    const row = await pool
      .request()
      .input('Id', sql.Int, insertResult.recordset[0].Id)
      .query(`${SELECT_SURVEY} WHERE s.Id = @Id`);

    res.status(201).json({
      success: true,
      message: 'Değerlendirmeniz paylaşıldı. Teşekkürler!',
      review: mapSurveyRow(row.recordset[0]),
    });
  } catch (error) {
    console.error('Değerlendirme kaydedilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.put('/surveys/:id', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const id = parseInt(req.params.id, 10);
    const { Rating, Comments } = req.body;
    const userId = req.user.userId;
    const rating = parseInt(Rating, 10);

    if (!userId || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli kullanıcı ve 1–5 arası puan zorunludur.',
      });
    }

    const pool = await getPool();
    const owner = await pool
      .request()
      .input('Id', sql.Int, id)
      .query('SELECT UserId FROM Surveys WHERE Id = @Id');

    if (!owner.recordset[0]) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı.' });
    }
    if (owner.recordset[0].UserId !== userId) {
      return res.status(403).json({ success: false, message: 'Bu değerlendirmeyi düzenleyemezsiniz.' });
    }

    await pool
      .request()
      .input('Id', sql.Int, id)
      .input('Rating', sql.Int, rating)
      .input('Comments', sql.NVarChar, Comments?.trim() || null)
      .query(`
        UPDATE Surveys
        SET Rating = @Rating, Comments = @Comments, UpdatedAt = GETDATE()
        WHERE Id = @Id
      `);

    const row = await pool
      .request()
      .input('Id', sql.Int, id)
      .query(`${SELECT_SURVEY} WHERE s.Id = @Id`);

    res.json({
      success: true,
      message: 'Değerlendirme güncellendi.',
      review: mapSurveyRow(row.recordset[0]),
    });
  } catch (error) {
    console.error('Değerlendirme güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.delete('/surveys/:id', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const pool = await getPool();
    const owner = await pool
      .request()
      .input('Id', sql.Int, id)
      .query('SELECT UserId FROM Surveys WHERE Id = @Id');

    if (!owner.recordset[0]) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı.' });
    }
    if (owner.recordset[0].UserId !== userId) {
      return res.status(403).json({ success: false, message: 'Bu değerlendirmeyi silemezsiniz.' });
    }

    await pool.request().input('Id', sql.Int, id).query('DELETE FROM Surveys WHERE Id = @Id');

    res.json({ success: true, message: 'Değerlendirme silindi.' });
  } catch (error) {
    console.error('Değerlendirme silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
