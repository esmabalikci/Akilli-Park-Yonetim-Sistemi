const express = require('express');
const cors = require('cors');
const lostFoundRoutes = require('./routes/lostFound');
const parksRouter = require('./routes/parks');
const authRoutes = require('./routes/authRoutes');
const reservationRouter = require('./routes/reservations');
const { connectDB, buildConfig } = require('./config/db');
const app = express();
const eventsRoutes = require('./routes/events');
const { router: notificationsRouter } = require('./routes/notifications');

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  const dbReady = Boolean(buildConfig());
  res.status(dbReady ? 200 : 503).json({
    ok: dbReady,
    database: dbReady ? 'configured' : 'missing .env (DB_USER / DB_PASSWORD)',
  });
});

app.use('/api', reservationRouter);
app.use('/api', lostFoundRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/parks', parksRouter);
app.use('/api', eventsRoutes);
app.use('/api', notificationsRouter);

const PORT = 3000;

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
    });
  })
  .catch((err) => {
    console.error('Sunucu başlatılamadı:', err.message);
    process.exit(1);
  });