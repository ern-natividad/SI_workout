import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import workoutRoutes from './routes/workouts.js';
import exercisesRoutes from './routes/exercises.js';
import usersRoutes from './routes/users.js';
import pool from './config/database.js';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration: allow a specific FRONTEND_URL in production, otherwise allow all (dev)
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.VITE_API_BASE || '';
if (process.env.NODE_ENV === 'production' && FRONTEND_URL) {
  app.use(cors({ origin: FRONTEND_URL }));
} else {
  app.use(cors());
}
// Basic security headers
// Disable COEP/COOP here so proxied images that set CORP can be embedded
// without the app requiring cross-origin isolation. Individual routes still
// set Cross-Origin-Resource-Policy / Access-Control-Allow-Origin as needed.
app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginOpenerPolicy: false }));

// Rate limiting (configurable via env vars)
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100; // general limit per window
const RATE_LIMIT_AUTH_MAX = parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 10; // stricter for auth endpoints

// Apply a stricter limiter to auth routes to prevent brute force, and a generous general limiter elsewhere.
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_AUTH_MAX,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX * 10, // more permissive for other routes in development
  standardHeaders: true,
  legacyHeaders: false,
});

// Use route-specific limiter for auth, and general limiter globally afterwards
app.use('/api/auth', authLimiter);
app.use(generalLimiter);
// Increase body size limits (configurable via MAX_JSON_SIZE env)
const MAX_JSON_SIZE = process.env.MAX_JSON_SIZE || '5mb';
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ limit: MAX_JSON_SIZE, extended: true }));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/users', usersRoutes);

// Debug: print registered routes to help diagnose missing endpoints in dev
try {
  const listRoutes = () => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // routes registered directly on the app
        const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
        routes.push({ path: middleware.route.path, methods });
      } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
        // router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
            routes.push({ path: handler.route.path, methods });
          }
        });
      }
    });
    console.log('Registered routes:', routes);
  };
  // Delay slightly so all routes are registered
  setTimeout(listRoutes, 300);
} catch (err) {
  console.warn('Could not list routes:', err && err.message);
}

// Serve uploaded files from the public/uploads folder
const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.error('Failed to ensure uploads directory exists:', err);
}
app.use('/uploads', express.static(uploadsDir));

// Serve frontend build (Vite `dist`) in production when present
const distDir = path.resolve(process.cwd(), '..', 'dist');
try {
  if (process.env.NODE_ENV === 'production') {
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distDir, 'index.html'));
      });
    } else {
      console.warn('Dist folder not found - build frontend before starting in production.');
    }
  }
} catch (err) {
  console.error('Error while attempting to serve dist folder:', err);
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Connected to MySQL'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Failed to connect to database',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  // handle payload too large specifically
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ success: false, message: 'Payload too large. Reduce avatar image size.' });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});

export default app;
