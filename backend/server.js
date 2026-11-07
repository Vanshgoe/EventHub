import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';
import seedSampleEvents from './utils/seedData.js';

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be configured in production.');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production.');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EventHub backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something unexpected went wrong.' });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedSampleEvents();
    app.listen(PORT, () => {
      console.log(`EventHub backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
