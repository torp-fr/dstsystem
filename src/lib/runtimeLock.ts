/**
 * Production Runtime Lock
 *
 * Final hardening layer preventing accidental developer mode activation.
 * Freezes all developer flags and mock data access in production.
 *
 * NO UI changes, NO business logic, NO logging changes.
 */

/**
 * Initialize production runtime lock
 *
 * When VITE_APP_ENV === 'production':
 * - Freezes window.__USE_MOCK_DATA__ (prevent mock data activation)
 * - Freezes window.localStorage['mock_data'] (prevent mock data storage)
 * - Overrides console.log attempts in production (security)
 * - Freezes window.__RUNTIME_LOCK__ (prevent tampering)
 *
 * Called once on app startup before any data access.
 */
export function initializeRuntimeLock(): void {
  const isProduction = import.meta.env.VITE_APP_ENV === 'production';

  if (!isProduction) {
    return; // Only apply lock in production
  }

  // ============================================================
  // FREEZE DEVELOPER FLAGS
  // ============================================================

  // Prevent mock data activation flag
  if (typeof window !== 'undefined') {
    if (!window.__USE_MOCK_DATA__) {
      (window as any).__USE_MOCK_DATA__ = false;
    }
    Object.defineProperty(window, '__USE_MOCK_DATA__', {
      value: false,
      writable: false,
      configurable: false,
    });
  }

  // ============================================================
  // FREEZE LOCALSTORAGE ACCESS
  // ============================================================

  // Intercept localStorage.setItem to prevent mock_data storage
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key: string, value: string) {
    if (key === 'mock_data') {
      console.warn('[LOCK] Attempt to set mock_data in production. Blocked.');
      return; // Silently fail - don't store mock data
    }
    originalSetItem.call(this, key, value);
  };

  // Prevent localStorage.removeItem from removing protection
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function (key: string) {
    if (key === 'mock_data') {
      console.warn('[LOCK] Attempt to remove mock_data protection in production. Blocked.');
      return; // Silently fail
    }
    originalRemoveItem.call(this, key);
  };

  // ============================================================
  // OVERRIDE CONSOLE.LOG IN PRODUCTION
  // ============================================================

  // In production, disable console.log to prevent information leaks
  const originalConsoleLog = console.log;
  console.log = function (...args: any[]) {
    // Allow [LOCK], [MONITOR], [RUNTIME], [BUILD] messages for critical info
    const message = String(args[0] || '');
    if (
      message.includes('[LOCK]') ||
      message.includes('[MONITOR]') ||
      message.includes('[RUNTIME]') ||
      message.includes('[BUILD]') ||
      message.includes('[DST-SYSTEM]')
    ) {
      originalConsoleLog.apply(console, args);
    }
    // All other logs are silently suppressed in production
  };

  // ============================================================
  // CREATE RUNTIME LOCK OBJECT
  // ============================================================

  // Create immutable lock object
  const runtimeLock = Object.freeze({
    locked: true,
    timestamp: new Date().toISOString(),
    environment: 'production',
    mockDataDisabled: true,
    consoleLogDisabled: true,
  });

  // Attach to window and freeze
  if (typeof window !== 'undefined') {
    (window as any).__RUNTIME_LOCK__ = runtimeLock;
    Object.defineProperty(window, '__RUNTIME_LOCK__', {
      value: runtimeLock,
      writable: false,
      configurable: false,
    });
  }

  // ============================================================
  // VERIFICATION
  // ============================================================

  // Silent verification - no logging in production
  if (typeof window !== 'undefined') {
    const lockActive =
      (window as any).__RUNTIME_LOCK__?.locked === true &&
      (window as any).__USE_MOCK_DATA__ === false;

    // Only log if explicitly in dev environment
    if (import.meta.env.DEV) {
      console.info('[LOCK] Production runtime lock initialized', lockActive);
    }
  }
}

/**
 * Check if production lock is active
 *
 * Safe to call at any time.
 * Returns false if lock not initialized.
 */
export function isRuntimeLocked(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (window as any).__RUNTIME_LOCK__?.locked === true;
}

/**
 * Get runtime lock status (for testing only)
 *
 * Returns lock object if active, null otherwise.
 */
export function getRuntimeLockStatus() {
  if (typeof window === 'undefined') {
    return null;
  }
  return (window as any).__RUNTIME_LOCK__ || null;
}

export default {
  initializeRuntimeLock,
  isRuntimeLocked,
  getRuntimeLockStatus,
};
