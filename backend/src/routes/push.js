const express = require('express');
const { getPool, sql, config, dbNotConfigured } = require('../utils/dbHelpers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/push/register', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const { expoPushToken } = req.body;
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli Expo push token gerekli.',
      });
    }

    const pool = await getPool();
    const existing = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('Token', sql.NVarChar, expoPushToken)
      .query('SELECT Id FROM PushTokens WHERE UserId = @UserId AND ExpoPushToken = @Token');

    if (!existing.recordset[0]) {
      await pool
        .request()
        .input('UserId', sql.Int, req.user.userId)
        .input('Token', sql.NVarChar, expoPushToken)
        .query(`
          INSERT INTO PushTokens (UserId, ExpoPushToken)
          VALUES (@UserId, @Token)
        `);
    }

    res.json({ success: true, message: 'Push token kaydedildi.' });
  } catch (error) {
    console.error('Push token kaydı hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.delete('/push/register', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const { expoPushToken } = req.body;
    const pool = await getPool();
    await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('Token', sql.NVarChar, expoPushToken)
      .query('DELETE FROM PushTokens WHERE UserId = @UserId AND ExpoPushToken = @Token');

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
