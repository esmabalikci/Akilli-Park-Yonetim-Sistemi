const express = require('express');
const cors = require('cors');
const lostFoundRoutes = require('./routes/lostFound');
const parksRouter = require('./routes/parks');
const authRoutes = require('./routes/authRoutes');
const reservationRouter = require('./routes/reservations');
const app = express();
const eventsRoutes = require('./routes/events');

app.use(cors());
app.use(express.json());
app.use('/api', reservationRouter);
app.use('/api', lostFoundRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/parks', parksRouter);
app.use('/api', eventsRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});