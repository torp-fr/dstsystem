import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import PlanningFilters from './PlanningFilters';
import PlanningSessionCard from './PlanningSessionCard';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';

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
      // Call service with filters
      const result = (window as any).Domain?.PlanningStateService?.getPlanningSessions(filters);

      if (!result) {
        setError('Service not initialized');
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSessions(result.sessions || []);
      } else {
        setError(result.error || 'Failed to load sessions');
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
            Total Sessions
          </div>
          <div className="text-3xl font-semibold text-foreground mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Operational
          </div>
          <div className="text-3xl font-semibold text-green-600 dark:text-green-400 mt-2">
            {stats.operational}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Awaiting Staffing
          </div>
          <div className="text-3xl font-semibold text-orange-600 dark:text-orange-400 mt-2">
            {stats.awaitingStaffing}
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
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
          title="No sessions found"
          description="Adjust your filters or create a new session to get started."
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
