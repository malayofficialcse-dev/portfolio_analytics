import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// -- Security headers ----------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// -- CORS ----------------------------------------------------------
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// -- General middleware ---------------------------------------------
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// -- Global rate limit ----------------------------------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// -- Health check --------------------------------------------------
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// -- Routes --------------------------------------------------------
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
// -- 404 & Error handler -------------------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;
