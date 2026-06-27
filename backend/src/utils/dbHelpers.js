const { sql, config } = require('../config/db');

function dbNotConfigured(res) {
  return res.status(503).json({
    success: false,
    message:
      'Veritabanı yapılandırması eksik. backend/.env dosyasını kontrol edin.',
  });
}

async function getPool() {
  if (!config) {
    throw new Error('Veritabanı yapılandırması eksik.');
  }
  return sql.connect(config);
}

function toIso(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

module.exports = {
  dbNotConfigured,
  getPool,
  toIso,
  sql,
  config,
};
