/**
 * Global Error Monitoring
 *
 * Captures unhandled errors and rejections at the application level.
 * Provides a centralized place to send errors to monitoring services.
 *
 * NO external service integration yet.
 * Placeholder for future monitoring backend.
 */

export interface MonitoringError {
  type: 'error' | 'rejection';
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * Error storage for monitoring (in-memory, limited)
 */
const errorLog: MonitoringError[] = [];
const MAX_ERRORS = 50; // Keep last 50 errors

/**
 * Send error to monitoring service
 *
 * Placeholder for future integration with:
 * - Sentry
 * - LogRocket
 * - Custom monitoring backend
 */
export function sendToMonitoringService(error: MonitoringError): void {
  // Add to local log
  errorLog.push(error);
  if (errorLog.length > MAX_ERRORS) {
    errorLog.shift();
  }

  // Log to console in production
  if (import.meta.env.PROD) {
    console.error('[MONITOR]', error.message, error);
  }

  // TODO: Integrate with monitoring service
  // Example:
  // await fetch('/api/monitoring/errors', {
  //   method: 'POST',
  //   body: JSON.stringify(error),
  // }).catch(err => console.error('Failed to send monitoring data:', err));
}

/**
 * Initialize global error monitoring
 *
 * Called on app startup to attach error handlers
 */
export function initializeMonitoring(): void {
  // Handle uncaught errors
  window.onerror = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ) => {
    const errorObj: MonitoringError = {
      type: 'error',
      message: String(message),
      stack: error?.stack,
      timestamp: Date.now(),
      context: {
        source,
        lineno,
        colno,
      },
    };

    sendToMonitoringService(errorObj);

    // Return false to allow default error handling
    return false;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const errorObj: MonitoringError = {
      type: 'rejection',
      message: String(event.reason),
      stack: event.reason?.stack,
      timestamp: Date.now(),
      context: {
        promiseState: 'rejected',
      },
    };

    sendToMonitoringService(errorObj);

    // Don't prevent default handling
  };

  // Log startup
  if (import.meta.env.PROD) {
    console.info('[MONITOR] Global error monitoring initialized');
  }
}

/**
 * Get recent errors (for debugging)
 */
export function getErrorLog(): MonitoringError[] {
  return [...errorLog];
}

/**
 * Clear error log (for testing)
 */
export function clearErrorLog(): void {
  errorLog.length = 0;
}

export default {
  initializeMonitoring,
  sendToMonitoringService,
  getErrorLog,
  clearErrorLog,
};
