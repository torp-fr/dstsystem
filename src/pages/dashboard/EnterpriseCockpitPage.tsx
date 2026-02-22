import React, { useEffect, useState } from 'react';
import PlanningSessionCard from '@/components/planning/PlanningSessionCard';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useRuntimeHealth, getHealthIndicator, getOverallHealth } from '@/hooks/useRuntimeHealth';
import { getPlanningSessionsSafe } from '@/services/planningBridge.service';

/**
 * EnterpriseCockpitPage — Enterprise Operations Overview
 *
 * Central hub displaying:
 * - Sessions awaiting staffing
 * - Operational sessions
 * - Sessions pending confirmation
 *
 * PURE READ-ONLY LAYER - no business logic, no automation
 */

interface PlanningSession {
  id: string;
  date: string;
  regionId: string;
  clientId: string;
  status: string;
  marketplaceVisible: boolean;
  setupIds: string[];
  staffing: {
    minOperators: number;
    acceptedOperators: number;
    pendingApplications: number;
    isOperational: boolean;
  };
}

export default function EnterpriseCockpitPage() {
  const [sessions, setSessions] = useState<PlanningSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const health = useRuntimeHealth();
  const overallHealth = getOverallHealth(health);
  const healthIndicator = getHealthIndicator(overallHealth);

  // ============================================================
  // FETCH DATA FROM PlanningStateService
  // ============================================================

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Get all planning sessions without filters
      const result = getPlanningSessionsSafe();

      if (!result) {
        // Service not initialized — graceful fallback
        // Display empty state without error banner
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSessions(result.sessions || []);
      } else {
        setError(result.error || 'Impossible de charger les sessions');
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // CATEGORIZE SESSIONS (UI ONLY)
  // ============================================================

  const categorizedSessions = {
    awaitingStaffing: sessions.filter(
      s => !s.staffing.isOperational && s.status !== 'pending_confirmation'
    ),
    operational: sessions.filter(s => s.staffing.isOperational),
    pendingConfirmation: sessions.filter(s => s.status === 'pending_confirmation')
  };

  // ============================================================
  // RENDER SECTION
  // ============================================================

  const renderSection = (title: string, subtitle: string, sessionList: PlanningSession[], color: string) => {
    // Theme-aware color mapping
    const colorMap = {
      orange: {
        bg: 'bg-destructive/5 border-destructive/30',
        text: 'text-destructive',
      },
      green: {
        bg: 'bg-emerald-600/5 border-emerald-600/30',
        text: 'text-emerald-600 dark:text-emerald-400',
      },
      blue: {
        bg: 'bg-blue-600/5 border-blue-600/30',
        text: 'text-blue-600 dark:text-blue-400',
      }
    };

    const currentColor = colorMap[color as keyof typeof colorMap] || colorMap.orange;

    return (
      <div className="flex flex-col gap-4">
        <div className={`rounded-lg border p-4 ${currentColor.bg}`}>
          <h2 className={`text-lg font-semibold ${currentColor.text}`}>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle} ({sessionList.length})
          </p>
        </div>

        {sessionList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucune session dans cette catégorie.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sessionList.map(session => (
              <PlanningSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // PAGE RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cockpit</h1>
          <p className="text-muted-foreground mt-1">
            Vue globale — Quoi est prêt, quoi bloque, quoi attend validation
          </p>
        </div>

        {/* System Health Indicator - Subtle Non-Technical */}
        <div className="flex flex-col items-end gap-0.5">
          <div className="text-xs text-muted-foreground font-medium opacity-50">
            État système
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-lg border text-xs"
            style={{ borderColor: healthIndicator.color, opacity: 0.6 }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: healthIndicator.color }}
            />
            <span className="text-muted-foreground font-medium">
              {healthIndicator.label === 'ok' ? 'Nominal' :
               healthIndicator.label === 'degraded' ? 'Dégradé' :
               'Alerte'}
            </span>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col gap-12">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <div className="bg-muted animate-pulse rounded-lg border p-4 h-16" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <SkeletonCard count={3} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COCKPIT SECTIONS */}
      {!loading && (
        <div className="flex flex-col gap-12">
          {/* SECTION 1: AWAITING STAFFING */}
          {renderSection(
            '⚠️ Opérateurs manquants',
            'Sessions bloquées en attente d\'affectations',
            categorizedSessions.awaitingStaffing,
            'orange'
          )}

          {/* SECTION 2: OPERATIONAL */}
          {renderSection(
            '✓ Prêtes à démarrer',
            'Toutes les affectations confirmées',
            categorizedSessions.operational,
            'green'
          )}

          {/* SECTION 3: PENDING CONFIRMATION */}
          {renderSection(
            '⏳ En validation',
            'Client ou administrateur doit confirmer',
            categorizedSessions.pendingConfirmation,
            'blue'
          )}
        </div>
      )}
    </div>
  );
}
