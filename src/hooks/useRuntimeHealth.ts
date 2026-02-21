import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { USE_SUPABASE } from '@/config/runtime';

/**
 * Runtime Health Status
 *
 * Tracks system health with simple, one-time checks:
 * - supabase: 'ok' | 'error' — Supabase connectivity
 * - auth: 'ok' | 'error' — Active session
 * - network: 'ok' | 'slow' — Network speed
 */
export interface RuntimeHealth {
  supabase: 'ok' | 'error';
  auth: 'ok' | 'error';
  network: 'ok' | 'slow';
}

/**
 * Hook: useRuntimeHealth
 *
 * Runs health checks ONCE on mount (no polling).
 * Returns current system health status.
 *
 * Usage:
 * const health = useRuntimeHealth();
 * if (health.supabase === 'error') { ... show alert ... }
 */
export function useRuntimeHealth() {
  const [health, setHealth] = useState<RuntimeHealth>({
    supabase: 'ok',
    auth: 'ok',
    network: 'ok',
  });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only run once
    if (checked) return;

    const checkHealth = async () => {
      const newHealth: RuntimeHealth = {
        supabase: 'ok',
        auth: 'ok',
        network: navigator.onLine ? 'ok' : 'slow',
      };

      // Check Supabase connectivity
      if (USE_SUPABASE) {
        try {
          const startTime = performance.now();
          const { data, error } = await supabase.auth.getSession();
          const endTime = performance.now();

          if (error) {
            newHealth.supabase = 'error';
            console.warn('[Health] Supabase error:', error.message);
          } else {
            // Check if session exists (auth status)
            newHealth.auth = data.session ? 'ok' : 'error';

            // If request took > 3 seconds, mark network as slow
            if (endTime - startTime > 3000) {
              newHealth.network = 'slow';
            }
          }
        } catch (error) {
          newHealth.supabase = 'error';
          console.warn('[Health] Supabase check failed:', error);
        }
      }

      setHealth(newHealth);
      setChecked(true);
    };

    checkHealth();
  }, [checked]);

  return health;
}

/**
 * Helper: Get health status icon/color
 *
 * Returns visual indicator for health status:
 * - 'ok' → green
 * - 'slow' → orange
 * - 'error' → red
 */
export function getHealthIndicator(status: 'ok' | 'error' | 'slow'): {
  color: string;
  label: string;
} {
  switch (status) {
    case 'ok':
      return { color: '#10b981', label: 'Operational' };
    case 'slow':
      return { color: '#f59e0b', label: 'Degraded' };
    case 'error':
      return { color: '#ef4444', label: 'Unavailable' };
  }
}

/**
 * Helper: Get overall system health
 *
 * Returns 'ok' if all systems operational,
 * 'slow' if any degraded,
 * 'error' if any critical failures.
 */
export function getOverallHealth(health: RuntimeHealth): 'ok' | 'slow' | 'error' {
  if (health.supabase === 'error' || health.auth === 'error') {
    return 'error';
  }
  if (health.network === 'slow') {
    return 'slow';
  }
  return 'ok';
}
