import mongoose from 'mongoose';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDB() {
  if (!ENV.MONGODB_URI) {
    logger.warn('MONGODB_URI is not set. DevTrack is running with the in-memory fallback demo store.');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    return true;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    logger.warn('DevTrack will use the in-memory fallback store so APIs remain functional for demonstration.');
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
