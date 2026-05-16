const path = require("path");
const sql = require("mssql");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || "localhost",
    database: process.env.DB_DATABASE || "apays_db",
    port: parseInt(process.env.DB_PORT || "1433", 10),
    options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        const pool = await sql.connect(config);
        console.log("SQL Server bağlantısı başarılı.");
        return pool;
    } catch (error) {
        console.error("Veritabanı bağlantı hatası:", error);
        throw error;
    }
}

module.exports = { sql, connectDB };