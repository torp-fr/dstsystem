import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import PlanningFilters from './PlanningFilters';
import PlanningSessionCard from './PlanningSessionCard';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';
import { getPlanningSessionsSafe } from '@/services/planningBridge.service';

/**
 * PlanningDashboard — Enterprise/Client Planning View
 *
 * PURE UI LAYER:
 * - Reads ONLY from Domain.PlanningStateService
 * - NO business logic, automation, or predictions
 * - Displays state only
 * - RoleGuardService visibility already applied by service
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

interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  region?: string;
  status?: string;
}

export default function PlanningDashboard() {
  const [sessions, setSessions] = useState<PlanningSession[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH DATA FROM PlanningStateService
  // ============================================================

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Call service with filters via bridge
      const result = getPlanningSessionsSafe(filters);

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
  }, [filters]);

  // ============================================================
  // CALCULATE STATS (UI ONLY — from loaded sessions)
  // ============================================================

  const stats = {
    total: sessions.length,
    operational: sessions.filter(s => s.staffing.isOperational).length,
    awaitingStaffing: sessions.filter(s => !s.staffing.isOperational).length
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* FILTERS BAR */}
      <div className="sticky top-0 bg-card border-b border-border p-4 rounded-lg">
        <PlanningFilters onFiltersChange={setFilters} />
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Au total
          </div>
          <div className="text-3xl font-semibold text-foreground mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Prêtes à démarrer
          </div>
          <div className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.operational}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Opérateurs manquants
          </div>
          <div className="text-3xl font-semibold text-destructive mt-2">
            {stats.awaitingStaffing}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SkeletonCard count={6} />
        </div>
      )}

      {/* SESSIONS GRID */}
      {!loading && sessions.length === 0 && !error && (
        <EmptyState
          icon={FileText}
          title="Aucune session trouvée"
          description="Ajustez vos filtres ou créez une nouvelle session pour commencer."
        />
      )}

      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(session => (
            <PlanningSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
