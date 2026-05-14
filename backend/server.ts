// backend/src/server.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initOIDC } from './src/controllers/auth.controller';


// Load environment variables
dotenv.config();

// Import configurations
import database from './src/config/database'
import { corsOptions } from './src/config/cors';
import logger from './src/utils/logger';



// // Import routes
import authRoutes from './src/routes/auth.routes';
import pollRoutes from './src/routes/poll.routes';
import responseRoutes from './src/routes/response.routes';
import analyticsRoutes from './src/routes/analytics.routes';

// // Import WebSocket handler
import { Server as SocketServer } from 'socket.io';
import { setupSocketHandlers } from './src/sockets/poll.socket';

// // Import middleware
import { errorHandler } from './src/middleware/errorHandler';
import { notFound } from './src/middleware/notFound';
import { apiRateLimiter } from './src/middleware/rateLimiter';

// Initialize express app
const app: Application = express();
app.use(cookieParser())
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

app.set('io', io);

// Setup socket handlers
setupSocketHandlers(io);

// ============ MIDDLEWARES ============

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session for OIDC
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

app.use('/api', apiRateLimiter);

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: database.getConnectionStatus()
  });
});


// ============ ERROR HANDLING ============
app.use(notFound);
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Initialize OIDC
    await initOIDC();
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔌 WebSocket server ready`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down server...');
  await database.disconnect();
  httpServer.close();
  process.exit(0);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();
app.locals.io = io;
export { app, io, httpServer };