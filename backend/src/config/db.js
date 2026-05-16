const path = require('path');
const sql = require('mssql');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

function buildConfig() {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const server = process.env.DB_SERVER || 'localhost';
  const database = process.env.DB_DATABASE || 'apays_db';
  const port = parseInt(process.env.DB_PORT || '1433', 10);

  if (!user || !password) {
    return null;
  }

  return {
    user,
    password,
    server,
    database,
    port,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true,
    },
  };
}

const config = buildConfig();

const connectDB = async () => {
  if (!config) {
    throw new Error(
      'Veritabanı yapılandırması eksik. backend/.env.example dosyasını .env olarak kopyalayıp doldurun.'
    );
  }
  await sql.connect(config);
  console.log('MSSQL Veritabanına başarıyla bağlanıldı (APAYS)');
};

module.exports = {
  sql,
  connectDB,
  config,
  buildConfig,
};
