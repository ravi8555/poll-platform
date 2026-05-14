// backend/src/config/database.ts
import mongoose from 'mongoose';
import logger from '../utils/logger';

let isConnected = false;

export async function connect(): Promise<void> {
  if (isConnected) {
    logger.info('Database already connected');
    return;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/poll-platform';
  
  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    logger.info(`✅ MongoDB connected to ${mongoUri}`);
    
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB error:', error);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnect(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

export function getConnectionStatus(): boolean {
  return isConnected;
}

export default { connect, disconnect, getConnectionStatus };