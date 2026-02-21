/**
 * Production Logger
 *
 * Handles console output with proper filtering for production.
 * - console.log() → disabled in production, enabled in dev
 * - console.warn() → always enabled
 * - console.error() → always enabled
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.log('debug message'); // Only in dev
 *   logger.warn('warning');      // Always
 *   logger.error('error');       // Always
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

interface Logger {
  log: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

/**
 * Production-safe logger
 */
export const logger: Logger = {
  /**
   * Development logging only
   * In production: disabled to reduce noise and improve performance
   */
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },

  /**
   * Always enabled - important information
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(message, ...args);
  },

  /**
   * Always enabled - critical errors
   */
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },

  /**
   * Info logging - always enabled
   */
  info: (message: string, ...args: any[]) => {
    console.info(message, ...args);
  },

  /**
   * Debug logging - only in development
   */
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  },
};

/**
 * Startup logging
 */
if (isProduction && typeof window !== 'undefined') {
  console.info('[LOGGER] ✅ Production logger initialized - console.log disabled');
}

export default logger;
