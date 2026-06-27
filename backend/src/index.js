const express = require('express');
const cors = require('cors');
const lostFoundRoutes = require('./routes/lostFound');
const parksRouter = require('./routes/parks');
const authRoutes = require('./routes/authRoutes');
const reservationRouter = require('./routes/reservations');
const { connectDB, buildConfig } = require('./config/db');
const { ensureSchema } = require('./db/ensureSchema');
const { seedIfEmpty } = require('./db/seed');
const app = express();
const eventsRoutes = require('./routes/events');
const { router: notificationsRouter } = require('./routes/notifications');
const surveysRouter = require('./routes/surveys');
const weatherRouter = require('./routes/weather');
const favoritesRouter = require('./routes/favorites');
const paymentsRouter = require('./routes/payments');
const pushRouter = require('./routes/push');
const picnicAreasRouter = require('./routes/picnicAreas');

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
app.use('/api', surveysRouter);
app.use('/api', weatherRouter);
app.use('/api', favoritesRouter);
app.use('/api', paymentsRouter);
app.use('/api', pushRouter);
app.use('/api', picnicAreasRouter);

const PORT = 3000;

connectDB()
  .then(() => ensureSchema())
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
    });
  })
  .catch((err) => {
    console.error('Sunucu başlatılamadı:', err.message);
    process.exit(1);
  });