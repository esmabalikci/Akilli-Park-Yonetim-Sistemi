const express = require('express');
const { getPool, dbNotConfigured, toIso, sql, config } = require('../utils/dbHelpers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function mapFavoriteRow(row) {
  let park = null;
  try {
    park = row.ParkData ? JSON.parse(row.ParkData) : null;
  } catch {
    park = null;
  }
  if (!park) {
    park = {
      id: row.ParkOsmId,
      name: row.ParkName,
      location: row.ParkLocation,
    };
  }
  return {
    id: row.Id,
    parkOsmId: row.ParkOsmId,
    park,
    createdAt: toIso(row.CreatedAt),
  };
}

router.get('/favorites', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const pool = await getPool();
    const result = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .query(`
        SELECT Id, UserId, ParkOsmId, ParkName, ParkLocation, ParkData, CreatedAt
        FROM Favorites
        WHERE UserId = @UserId
        ORDER BY CreatedAt DESC
      `);

    res.json({
      success: true,
      favorites: result.recordset.map(mapFavoriteRow),
    });
  } catch (error) {
    console.error('Favoriler çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/favorites', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const { parkOsmId, parkName, parkLocation, parkData } = req.body;
    if (!parkOsmId) {
      return res.status(400).json({ success: false, message: 'Park kimliği zorunludur.' });
    }

    const pool = await getPool();
    const existing = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('ParkOsmId', sql.NVarChar, String(parkOsmId))
      .query('SELECT Id FROM Favorites WHERE UserId = @UserId AND ParkOsmId = @ParkOsmId');

    if (existing.recordset[0]) {
      return res.json({ success: true, message: 'Zaten favorilerde.', alreadyExists: true });
    }

    const parkJson = parkData ? JSON.stringify(parkData) : null;
    const result = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('ParkOsmId', sql.NVarChar, String(parkOsmId))
      .input('ParkName', sql.NVarChar, parkName || 'Park')
      .input('ParkLocation', sql.NVarChar, parkLocation || null)
      .input('ParkData', sql.NVarChar, parkJson)
      .query(`
        INSERT INTO Favorites (UserId, ParkOsmId, ParkName, ParkLocation, ParkData)
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.ParkOsmId, INSERTED.ParkName,
               INSERTED.ParkLocation, INSERTED.ParkData, INSERTED.CreatedAt
        VALUES (@UserId, @ParkOsmId, @ParkName, @ParkLocation, @ParkData)
      `);

    res.status(201).json({
      success: true,
      favorite: mapFavoriteRow(result.recordset[0]),
    });
  } catch (error) {
    console.error('Favori eklenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.delete('/favorites/:parkOsmId', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const parkOsmId = decodeURIComponent(req.params.parkOsmId);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('ParkOsmId', sql.NVarChar, parkOsmId)
      .query('DELETE FROM Favorites WHERE UserId = @UserId AND ParkOsmId = @ParkOsmId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Favori bulunamadı.' });
    }

    res.json({ success: true, message: 'Favoriden kaldırıldı.' });
  } catch (error) {
    console.error('Favori silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/favorites/sync', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const { favorites = [] } = req.body;
    const pool = await getPool();

    for (const item of favorites) {
      const parkOsmId = String(item.parkOsmId || item.park?.id || '');
      if (!parkOsmId) continue;

      const exists = await pool
        .request()
        .input('UserId', sql.Int, req.user.userId)
        .input('ParkOsmId', sql.NVarChar, parkOsmId)
        .query('SELECT Id FROM Favorites WHERE UserId = @UserId AND ParkOsmId = @ParkOsmId');

      if (exists.recordset[0]) continue;

      await pool
        .request()
        .input('UserId', sql.Int, req.user.userId)
        .input('ParkOsmId', sql.NVarChar, parkOsmId)
        .input('ParkName', sql.NVarChar, item.parkName || item.park?.name || 'Park')
        .input('ParkLocation', sql.NVarChar, item.parkLocation || item.park?.location || null)
        .input('ParkData', sql.NVarChar, item.park ? JSON.stringify(item.park) : null)
        .query(`
          INSERT INTO Favorites (UserId, ParkOsmId, ParkName, ParkLocation, ParkData)
          VALUES (@UserId, @ParkOsmId, @ParkName, @ParkLocation, @ParkData)
        `);
    }

    const all = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .query(`
        SELECT Id, UserId, ParkOsmId, ParkName, ParkLocation, ParkData, CreatedAt
        FROM Favorites WHERE UserId = @UserId ORDER BY CreatedAt DESC
      `);

    res.json({
      success: true,
      favorites: all.recordset.map(mapFavoriteRow),
    });
  } catch (error) {
    console.error('Favori senkron hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
