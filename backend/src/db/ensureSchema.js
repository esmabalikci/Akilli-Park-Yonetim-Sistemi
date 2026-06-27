const { getPool, sql } = require('../utils/dbHelpers');

const REQUIRED_TABLES = [
  'Users', 'Reservations', 'Events', 'LostFoundItems', 'Notifications', 'Surveys', 'Favorites',
];

async function tableExists(pool, tableName) {
  const result = await pool
    .request()
    .input('TableName', sql.NVarChar, tableName)
    .query(
      `SELECT 1 AS found FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @TableName`
    );
  return result.recordset.length > 0;
}

async function runStatement(pool, label, query, { optional = false } = {}) {
  try {
    const request = pool.request();
    if (optional) {
      request.timeout = 8000;
    }
    await request.query(query);
  } catch (error) {
    const skippable =
      optional ||
      error.number === 262 ||
      /permission denied/i.test(error.message || '') ||
      /timeout/i.test(error.message || '');

    if (skippable) {
      console.warn(`Şema adımı atlandı (${label}):`, error.message);
      return false;
    }

    console.error(`Şema adımı başarısız (${label}):`, error.message);
    throw error;
  }
  return true;
}

async function verifyRequiredTables(pool) {
  const missing = [];
  for (const table of REQUIRED_TABLES) {
    if (!(await tableExists(pool, table))) {
      missing.push(table);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Eksik tablolar: ${missing.join(', ')}. ` +
        'backend/database_schema.sql veya database_migrate_v2.sql dosyasını SQL Server yöneticisi olarak çalıştırın.'
    );
  }
}

/**
 * Eksik tabloları oluşturur ve Reservations tablosunu OSM park desteğine uyarlar.
 */
async function ensureSchema() {
  const pool = await getPool();

  await runStatement(
    pool,
    'Events',
    `
    IF OBJECT_ID('Events', 'U') IS NULL
    CREATE TABLE Events (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      Title NVARCHAR(200) NOT NULL,
      ParkName NVARCHAR(200) NOT NULL,
      EventDate NVARCHAR(10) NOT NULL,
      EventTime NVARCHAR(10) NOT NULL,
      Description NVARCHAR(MAX) NOT NULL,
      AllowParticipation BIT NOT NULL DEFAULT 0,
      Capacity INT NULL,
      ParticipantCount INT NOT NULL DEFAULT 0,
      Status NVARCHAR(50) NOT NULL DEFAULT 'Aktif',
      CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'Yetkili',
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
    );
    `
  );

  await runStatement(
    pool,
    'LostFoundItems',
    `
    IF OBJECT_ID('LostFoundItems', 'U') IS NULL
    CREATE TABLE LostFoundItems (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT NULL,
      Type NVARCHAR(20) NOT NULL,
      ItemName NVARCHAR(200) NOT NULL,
      Description NVARCHAR(MAX) NOT NULL,
      ParkName NVARCHAR(200) NOT NULL,
      ContactInfo NVARCHAR(300) NULL,
      Status NVARCHAR(50) NOT NULL DEFAULT N'Açık',
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT FK_LostFoundItems_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
    );
    `
  );

  await runStatement(
    pool,
    'Notifications',
    `
    IF OBJECT_ID('Notifications', 'U') IS NULL
    CREATE TABLE Notifications (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT NULL,
      Type NVARCHAR(50) NOT NULL DEFAULT 'system',
      Title NVARCHAR(200) NOT NULL,
      Message NVARCHAR(MAX) NOT NULL,
      IsRead BIT NOT NULL DEFAULT 0,
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT FK_Notifications_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
    `
  );

  await runStatement(
    pool,
    'Surveys',
    `
    IF OBJECT_ID('Surveys', 'U') IS NULL
    CREATE TABLE Surveys (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT NOT NULL,
      ReservationId INT NULL,
      ParkOsmId NVARCHAR(100) NULL,
      ParkName NVARCHAR(200) NULL,
      Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
      Comments NVARCHAR(MAX) NULL,
      SourceType NVARCHAR(20) NOT NULL DEFAULT 'park',
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      UpdatedAt DATETIME NULL,
      CONSTRAINT FK_Surveys_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
      CONSTRAINT FK_Surveys_ReservationId FOREIGN KEY (ReservationId) REFERENCES Reservations(Id) ON DELETE NO ACTION
    );
    `
  );

  await runStatement(
    pool,
    'Surveys.ParkOsmId',
    `
    IF OBJECT_ID('Surveys', 'U') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Surveys') AND name = 'ParkOsmId'
      )
    ALTER TABLE Surveys ADD ParkOsmId NVARCHAR(100) NULL;
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Surveys.ParkName',
    `
    IF OBJECT_ID('Surveys', 'U') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Surveys') AND name = 'ParkName'
      )
    ALTER TABLE Surveys ADD ParkName NVARCHAR(200) NULL;
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Surveys.SourceType',
    `
    IF OBJECT_ID('Surveys', 'U') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Surveys') AND name = 'SourceType'
      )
    ALTER TABLE Surveys ADD SourceType NVARCHAR(20) NOT NULL DEFAULT 'park';
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Surveys.UpdatedAt',
    `
    IF OBJECT_ID('Surveys', 'U') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Surveys') AND name = 'UpdatedAt'
      )
    ALTER TABLE Surveys ADD UpdatedAt DATETIME NULL;
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Reservations.ParkName',
    `
    IF OBJECT_ID('Reservations', 'U') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Reservations') AND name = 'ParkName'
      )
    ALTER TABLE Reservations ADD ParkName NVARCHAR(200) NULL;
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Reservations.ParkOsmId',
    `
    IF OBJECT_ID('Reservations', 'U') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Reservations') AND name = 'ParkOsmId'
      )
    ALTER TABLE Reservations ADD ParkOsmId NVARCHAR(100) NULL;
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Reservations.CottageName',
    `
    IF OBJECT_ID('Reservations', 'U') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Reservations') AND name = 'CottageName'
      )
    ALTER TABLE Reservations ADD CottageName NVARCHAR(100) NULL;
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Reservations.dropPicnicFk',
    `
    IF OBJECT_ID('Reservations', 'U') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Reservations_PicnicAreaId'
      )
    ALTER TABLE Reservations DROP CONSTRAINT FK_Reservations_PicnicAreaId;
    `,
    { optional: true }
  );

  await runStatement(
    pool,
    'Reservations.nullablePicnicAreaId',
    `
    IF OBJECT_ID('Reservations', 'U') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Reservations')
          AND name = 'PicnicAreaId'
          AND is_nullable = 0
      )
    ALTER TABLE Reservations ALTER COLUMN PicnicAreaId INT NULL;
    `,
    { optional: true }
  );

  await pool
    .request()
    .query(`UPDATE Reservations SET ParkName = N'Park' WHERE ParkName IS NULL;`)
    .catch(() => {});

  await runStatement(pool, 'Favorites', `
    IF OBJECT_ID('Favorites', 'U') IS NULL
    CREATE TABLE Favorites (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT NOT NULL,
      ParkOsmId NVARCHAR(100) NOT NULL,
      ParkName NVARCHAR(200) NULL,
      ParkLocation NVARCHAR(300) NULL,
      ParkData NVARCHAR(MAX) NULL,
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT FK_Favorites_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
      CONSTRAINT UQ_Favorites_UserPark UNIQUE (UserId, ParkOsmId)
    );
  `);

  await runStatement(pool, 'PaymentMethods', `
    IF OBJECT_ID('PaymentMethods', 'U') IS NULL
    CREATE TABLE PaymentMethods (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT NOT NULL,
      CardLastFour NVARCHAR(4) NOT NULL,
      CardBrand NVARCHAR(20) NULL,
      CardName NVARCHAR(100) NULL,
      ExpiryMonth INT NULL,
      ExpiryYear INT NULL,
      Token NVARCHAR(255) NOT NULL,
      IsDefault BIT NOT NULL DEFAULT 0,
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT FK_PaymentMethods_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
  `, { optional: true });

  await runStatement(pool, 'Payments', `
    IF OBJECT_ID('Payments', 'U') IS NULL
    CREATE TABLE Payments (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT NOT NULL,
      ReservationId INT NULL,
      Amount DECIMAL(10,2) NOT NULL,
      Currency NVARCHAR(3) NOT NULL DEFAULT 'TRY',
      Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
      PaymentMethodId INT NULL,
      Description NVARCHAR(300) NULL,
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT FK_Payments_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
      CONSTRAINT FK_Payments_ReservationId FOREIGN KEY (ReservationId) REFERENCES Reservations(Id) ON DELETE NO ACTION
    );
  `, { optional: true });

  await runStatement(pool, 'PushTokens', `
    IF OBJECT_ID('PushTokens', 'U') IS NULL
    CREATE TABLE PushTokens (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT NOT NULL,
      ExpoPushToken NVARCHAR(255) NOT NULL,
      CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT FK_PushTokens_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
      CONSTRAINT UQ_PushTokens_UserToken UNIQUE (UserId, ExpoPushToken)
    );
  `, { optional: true });

  await runStatement(pool, 'PicnicAreas.ParkOsmId', `
    IF OBJECT_ID('PicnicAreas', 'U') IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PicnicAreas') AND name = 'ParkOsmId')
    ALTER TABLE PicnicAreas ADD ParkOsmId NVARCHAR(100) NULL;
  `, { optional: true });

  await runStatement(pool, 'PicnicAreas.ParkName', `
    IF OBJECT_ID('PicnicAreas', 'U') IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PicnicAreas') AND name = 'ParkName')
    ALTER TABLE PicnicAreas ADD ParkName NVARCHAR(200) NULL;
  `, { optional: true });

  await runStatement(pool, 'Reservations.PaymentId', `
    IF OBJECT_ID('Reservations', 'U') IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Reservations') AND name = 'PaymentId')
    ALTER TABLE Reservations ADD PaymentId INT NULL;
  `, { optional: true });

  await verifyRequiredTables(pool);
  console.log('Veritabanı şeması doğrulandı.');
}

module.exports = { ensureSchema };
