import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import commentRoutes from './routes/comments.js';
import contentRoutes from './routes/contents.js';
import dashboardRoutes from './routes/dashboard.js';
import likeRoutes from './routes/likes.js';
import { handleError, notFound } from './middleware/errors.js';

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed by the CORS policy.'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/api/health', (request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(handleError);

export default app;
