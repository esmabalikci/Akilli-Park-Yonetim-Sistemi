const axios = require('axios');
const { getPool, sql } = require('../utils/dbHelpers');

async function getUserPushTokens(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('UserId', sql.Int, userId)
    .query('SELECT ExpoPushToken FROM PushTokens WHERE UserId = @UserId');

  return result.recordset.map((r) => r.ExpoPushToken);
}

async function sendExpoPush(userId, { title, message, data = {} }) {
  if (!userId) return;

  try {
    const tokens = await getUserPushTokens(userId);
    if (!tokens.length) return;

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body: message,
      data,
    }));

    await axios.post('https://exp.host/--/api/v2/push/send', messages, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  } catch (error) {
    console.warn('Push bildirimi gönderilemedi:', error.message);
  }
}

module.exports = { sendExpoPush, getUserPushTokens };
