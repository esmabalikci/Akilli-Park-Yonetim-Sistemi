const { getPool, sql } = require('../utils/dbHelpers');

/**
 * Aynı park + çardak için çakışan rezervasyon var mı kontrol eder.
 */
async function hasReservationConflict({
  parkOsmId,
  cottageName,
  picnicAreaId,
  startTime,
  endTime,
  excludeReservationId = null,
}) {
  const pool = await getPool();
  const request = pool
    .request()
    .input('StartTime', sql.DateTime2, startTime)
    .input('EndTime', sql.DateTime2, endTime);

  let query = `
    SELECT COUNT(*) AS cnt FROM Reservations
    WHERE Status NOT IN (N'Cancelled', N'İptal')
      AND StartTime < @EndTime AND EndTime > @StartTime
  `;

  if (excludeReservationId) {
    request.input('ExcludeId', sql.Int, excludeReservationId);
    query += ' AND Id <> @ExcludeId';
  }

  if (cottageName) {
    request.input('CottageName', sql.NVarChar, cottageName);
    query += ' AND CottageName = @CottageName';
  }

  if (parkOsmId) {
    request.input('ParkOsmId', sql.NVarChar, parkOsmId);
    query += ' AND ParkOsmId = @ParkOsmId';
  } else if (picnicAreaId) {
    request.input('PicnicAreaId', sql.Int, picnicAreaId);
    query += ' AND PicnicAreaId = @PicnicAreaId';
  } else {
    return false;
  }

  const result = await request.query(query);
  return result.recordset[0].cnt > 0;
}

async function ensurePicnicAreaForCottage({ parkOsmId, parkName, cottageName }) {
  if (!parkOsmId || !cottageName) return null;

  const pool = await getPool();
  const existing = await pool
    .request()
    .input('ParkOsmId', sql.NVarChar, parkOsmId)
    .input('CottageName', sql.NVarChar, cottageName)
    .query(`
      SELECT Id FROM PicnicAreas
      WHERE ParkOsmId = @ParkOsmId AND Name = @CottageName
    `);

  if (existing.recordset[0]) {
    return existing.recordset[0].Id;
  }

  const inserted = await pool
    .request()
    .input('Name', sql.NVarChar, cottageName)
    .input('ParkOsmId', sql.NVarChar, parkOsmId)
    .input('ParkName', sql.NVarChar, parkName || 'Park')
    .input('Capacity', sql.Int, 8)
    .query(`
      INSERT INTO PicnicAreas (Name, Capacity, IsAvailable, LocationDescription, ParkOsmId, ParkName)
      OUTPUT INSERTED.Id
      VALUES (@Name, @Capacity, 1, @ParkName, @ParkOsmId, @ParkName)
    `);

  return inserted.recordset[0]?.Id || null;
}

async function getCottageAvailability({ parkOsmId, cottageName, startTime, endTime }) {
  const conflict = await hasReservationConflict({
    parkOsmId,
    cottageName,
    startTime,
    endTime,
  });

  return {
    available: !conflict,
    cottageName,
    parkOsmId,
  };
}

module.exports = {
  hasReservationConflict,
  ensurePicnicAreaForCottage,
  getCottageAvailability,
};
