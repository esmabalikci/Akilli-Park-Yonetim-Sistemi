const express = require('express');
const { getPool, dbNotConfigured, toIso, sql, config } = require('../utils/dbHelpers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function mapLostFoundRow(row) {
  return {
    Id: row.Id,
    UserId: row.UserId,
    Type: row.Type,
    ItemName: row.ItemName,
    Description: row.Description,
    ParkName: row.ParkName,
    ContactInfo: row.ContactInfo,
    Status: row.Status,
    CreatedAt: toIso(row.CreatedAt),
  };
}

async function userExists(pool, userId) {
  if (!userId) return false;
  const result = await pool
    .request()
    .input('UserId', sql.Int, userId)
    .query('SELECT Id FROM Users WHERE Id = @UserId');
  return result.recordset.length > 0;
}

router.get('/lost-found', async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id, UserId, Type, ItemName, Description, ParkName, ContactInfo, Status, CreatedAt
      FROM LostFoundItems
      ORDER BY CreatedAt DESC
    `);

    res.status(200).json(result.recordset.map(mapLostFoundRow));
  } catch (error) {
    console.error('Kayıp/Bulunan ilanları çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/lost-found', authenticate, async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const {
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

    const pool = await getPool();
    const userId = req.user.userId;

    const result = await pool
      .request()
      .input('UserId', sql.Int, userId)
      .input('Type', sql.NVarChar, Type)
      .input('ItemName', sql.NVarChar, ItemName)
      .input('Description', sql.NVarChar, Description)
      .input('ParkName', sql.NVarChar, ParkName)
      .input('ContactInfo', sql.NVarChar, ContactInfo || 'İletişim bilgisi yok')
      .input('Status', sql.NVarChar, Status || 'Açık')
      .query(`
        INSERT INTO LostFoundItems (
          UserId, Type, ItemName, Description, ParkName, ContactInfo, Status
        )
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.Type, INSERTED.ItemName,
               INSERTED.Description, INSERTED.ParkName, INSERTED.ContactInfo,
               INSERTED.Status, INSERTED.CreatedAt
        VALUES (
          @UserId, @Type, @ItemName, @Description, @ParkName, @ContactInfo, @Status
        )
      `);

    const newItem = mapLostFoundRow(result.recordset[0]);

    res.status(201).json({
      success: true,
      message: 'İlan başarıyla oluşturuldu.',
      item: newItem,
    });
  } catch (error) {
    console.error('Kayıp/Bulunan ilanı oluşturulurken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.put('/lost-found/:id/status', async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const id = parseInt(req.params.id, 10);
    const { Status } = req.body;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('Id', sql.Int, id)
      .input('Status', sql.NVarChar, Status || 'Kapalı')
      .query(`
        UPDATE LostFoundItems
        SET Status = @Status
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.Type, INSERTED.ItemName,
               INSERTED.Description, INSERTED.ParkName, INSERTED.ContactInfo,
               INSERTED.Status, INSERTED.CreatedAt
        WHERE Id = @Id
      `);

    if (!result.recordset[0]) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'İlan durumu güncellendi.',
      item: mapLostFoundRow(result.recordset[0]),
    });
  } catch (error) {
    console.error('İlan durumu güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.put('/lost-found/:id', authenticate, async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const id = parseInt(req.params.id, 10);
    const { Type, ItemName, Description, ParkName, ContactInfo } = req.body;

    const pool = await getPool();
    const existing = await pool
      .request()
      .input('Id', sql.Int, id)
      .query('SELECT * FROM LostFoundItems WHERE Id = @Id');

    const item = existing.recordset[0];
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.',
      });
    }

    if (item.UserId !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu ilanı düzenleme yetkiniz yok.',
      });
    }

    const result = await pool
      .request()
      .input('Id', sql.Int, id)
      .input('Type', sql.NVarChar, Type || item.Type)
      .input('ItemName', sql.NVarChar, ItemName || item.ItemName)
      .input('Description', sql.NVarChar, Description || item.Description)
      .input('ParkName', sql.NVarChar, ParkName || item.ParkName)
      .input('ContactInfo', sql.NVarChar, ContactInfo || item.ContactInfo)
      .query(`
        UPDATE LostFoundItems
        SET Type = @Type,
            ItemName = @ItemName,
            Description = @Description,
            ParkName = @ParkName,
            ContactInfo = @ContactInfo
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.Type, INSERTED.ItemName,
               INSERTED.Description, INSERTED.ParkName, INSERTED.ContactInfo,
               INSERTED.Status, INSERTED.CreatedAt
        WHERE Id = @Id
      `);

    res.status(200).json({
      success: true,
      message: 'İlan başarıyla güncellendi.',
      item: mapLostFoundRow(result.recordset[0]),
    });
  } catch (error) {
    console.error('İlan güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.delete('/lost-found/:id', authenticate, async (req, res) => {
  try {
    if (!config) {
      return dbNotConfigured(res);
    }

    const id = parseInt(req.params.id, 10);
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('Id', sql.Int, id)
      .query('SELECT UserId FROM LostFoundItems WHERE Id = @Id');

    const item = existing.recordset[0];
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.',
      });
    }

    if (item.UserId !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu ilanı silme yetkiniz yok.',
      });
    }

    const result = await pool
      .request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM LostFoundItems WHERE Id = @Id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'İlan başarıyla silindi.',
    });
  } catch (error) {
    console.error('İlan silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
