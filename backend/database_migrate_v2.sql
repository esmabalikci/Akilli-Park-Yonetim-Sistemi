-- APAYS v2 Migration
-- Mevcut veritabanına yeni tabloları ve Reservations güncellemelerini ekler.
-- SQL Server yöneticisi (sa veya db_owner) olarak çalıştırın.

USE apays_db;
GO

-- Reservations: OSM park desteği
IF OBJECT_ID('Reservations', 'U') IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Reservations') AND name = 'ParkName')
    ALTER TABLE Reservations ADD ParkName NVARCHAR(200) NULL;

  IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Reservations') AND name = 'ParkOsmId')
    ALTER TABLE Reservations ADD ParkOsmId NVARCHAR(100) NULL;

  IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Reservations') AND name = 'CottageName')
    ALTER TABLE Reservations ADD CottageName NVARCHAR(100) NULL;

  IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Reservations_PicnicAreaId')
    ALTER TABLE Reservations DROP CONSTRAINT FK_Reservations_PicnicAreaId;

  IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Reservations') AND name = 'PicnicAreaId' AND is_nullable = 0
  )
    ALTER TABLE Reservations ALTER COLUMN PicnicAreaId INT NULL;
END
GO

IF OBJECT_ID('Reservations', 'U') IS NOT NULL
  AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Reservations') AND name = 'ParkName')
  UPDATE Reservations SET ParkName = N'Park' WHERE ParkName IS NULL;
GO

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
GO

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
GO

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
GO

PRINT 'Migration v2 tamamlandı.';
GO

-- Surveys: park değerlendirme desteği
IF OBJECT_ID('Surveys', 'U') IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Surveys') AND name = 'ParkOsmId')
    ALTER TABLE Surveys ADD ParkOsmId NVARCHAR(100) NULL;
  IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Surveys') AND name = 'ParkName')
    ALTER TABLE Surveys ADD ParkName NVARCHAR(200) NULL;
  IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Surveys') AND name = 'SourceType')
    ALTER TABLE Surveys ADD SourceType NVARCHAR(20) NOT NULL DEFAULT 'park';
  IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Surveys') AND name = 'UpdatedAt')
    ALTER TABLE Surveys ADD UpdatedAt DATETIME NULL;
END
GO

PRINT 'Migration v3 (Surveys) tamamlandı.';
GO

-- v4: Favoriler, ödeme, push bildirimleri
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
GO

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
GO

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
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

IF OBJECT_ID('PushTokens', 'U') IS NULL
CREATE TABLE PushTokens (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ExpoPushToken NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PushTokens_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_PushTokens_UserToken UNIQUE (UserId, ExpoPushToken)
);
GO

PRINT 'Migration v4 (Favorites, Payments, Push) tamamlandı.';
