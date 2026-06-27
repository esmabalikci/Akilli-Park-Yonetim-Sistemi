-- APAYS Veritabanı Oluşturma Scripti
-- MSSQL (SQL Server) için hazırlanmıştır.

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'apays_db')
BEGIN
  CREATE DATABASE apays_db;
END
GO

USE apays_db;
GO

-- 1. Users (Kullanıcılar) Tablosu
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'User', -- 'Admin' veya 'User'
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 2. PicnicAreas (Kamelyalar/Piknik Alanları) Tablosu
IF OBJECT_ID('PicnicAreas', 'U') IS NOT NULL DROP TABLE PicnicAreas;
CREATE TABLE PicnicAreas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Capacity INT NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    LocationDescription NVARCHAR(500),
    ImageUrl NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 3. Reservations (Rezervasyonlar) Tablosu
IF OBJECT_ID('Reservations', 'U') IS NOT NULL DROP TABLE Reservations;
CREATE TABLE Reservations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    PicnicAreaId INT NULL,
    ParkOsmId NVARCHAR(100) NULL,
    ParkName NVARCHAR(200) NOT NULL,
    CottageName NVARCHAR(100) NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Onaylandı',
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Reservations_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
GO

-- 4. Surveys (Değerlendirmeler / Memnuniyet) Tablosu
IF OBJECT_ID('Surveys', 'U') IS NOT NULL DROP TABLE Surveys;
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
GO

-- 5. SystemLogs (Sistem Kayıtları) Tablosu
IF OBJECT_ID('SystemLogs', 'U') IS NOT NULL DROP TABLE SystemLogs;
CREATE TABLE SystemLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ActionType NVARCHAR(100) NOT NULL,
    UserId INT NULL,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_SystemLogs_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION
);
GO

-- 6. Events (Etkinlikler) Tablosu
IF OBJECT_ID('Events', 'U') IS NOT NULL DROP TABLE Events;
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

-- 7. LostFoundItems (Kayıp/Bulunan) Tablosu
IF OBJECT_ID('LostFoundItems', 'U') IS NOT NULL DROP TABLE LostFoundItems;
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

-- 8. Notifications (Bildirimler) Tablosu
IF OBJECT_ID('Notifications', 'U') IS NOT NULL DROP TABLE Notifications;
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

PRINT 'Tüm tablolar başarıyla oluşturuldu! (APAYS Database)';
