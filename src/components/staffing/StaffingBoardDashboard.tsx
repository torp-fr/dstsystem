import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import StaffingSessionCard from './StaffingSessionCard';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';

/**
 * StaffingBoardDashboard — Enterprise Staffing Management
 *
 * PURE UI LAYER:
 * - Reads ONLY from Domain.PlanningStateService.getPlanningSessions()
 * - Displays confirmed marketplace sessions
 * - Shows operator applications (accepted/pending/rejected)
 * - NO automation, NO scoring, NO suggestions
 * - Manual ACCEPT/REJECT actions via MarketplaceController
 */

interface SessionStaffing {
  minOperators: number;
  acceptedOperators: number;
  pendingApplications: number;
  isOperational: boolean;
}

interface StaffingSession {
  id: string;
  date: string;
  regionId: string;
  clientId: string;
  status: string;
  marketplaceVisible: boolean;
  setupIds: string[];
  staffing: SessionStaffing;
}

export default function StaffingBoardDashboard() {
  const [sessions, setSessions] = useState<StaffingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionRefresh, setActionRefresh] = useState(0);

  // ============================================================
  // FETCH SESSIONS ON MOUNT
  // ============================================================

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Get all confirmed marketplace sessions
      const result = (window as any).Domain?.PlanningStateService?.getPlanningSessions({
        status: 'confirmed'
      });

      if (!result) {
        setError('Le service n\'est pas initialisé');
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        // Filter to marketplace visible sessions only
        const filteredSessions = (result.sessions || []).filter(
          (s: StaffingSession) => s.marketplaceVisible
        );
        setSessions(filteredSessions);
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
  }, [actionRefresh]);

  // ============================================================
  // CALCULATE STATS
  // ============================================================

  const stats = {
    total: sessions.length,
    operational: sessions.filter(s => s.staffing.isOperational).length,
    awaiting: sessions.filter(s => !s.staffing.isOperational).length
  };

  // ============================================================
  // HANDLE OPERATOR ACTIONS
  // ============================================================

  const handleOperatorAction = () => {
    // Trigger refresh to show updated state
    setActionRefresh(prev => prev + 1);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Affectations</h1>
        <p className="text-muted-foreground mt-1">
          Validation humaine des candidatures — Acceptez ou rejetez les opérateurs
        </p>
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
            Opérationnelles
          </div>
          <div className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.operational}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            En attente
          </div>
          <div className="text-3xl font-semibold text-destructive mt-2">
            {stats.awaiting}
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

      {/* EMPTY STATE */}
      {!loading && sessions.length === 0 && !error && (
        <EmptyState
          icon={Users}
          title="Aucune session en attente de staffing"
          description="Toutes les sessions marketplace actuelles sont opérationnelles ou complètement staffées."
        />
      )}

      {/* SESSIONS GRID */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(session => (
            <StaffingSessionCard
              key={session.id}
              session={session}
              onAction={handleOperatorAction}
            />
          ))}
        </div>
      )}

      {/* INSTRUCTION */}
      {!loading && sessions.length > 0 && (
        <div className="mt-8 p-4 bg-blue-600/5 rounded-lg border border-blue-600/30">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Procédure :</strong> Examinez chaque candidature en attente et cliquez
            sur « Accepter » ou « Rejeter ». Les candidatures acceptées compteront vers le nombre
            requis d'opérateurs.
          </p>
        </div>
      )}
    </div>
  );
}
