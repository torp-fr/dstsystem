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
        setError('Service not initialized');
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
        setError(result.error || 'Failed to load sessions');
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
        <h1 className="text-3xl font-bold text-gray-800">Staffing Board</h1>
        <p className="text-gray-600 mt-1">
          Validation humaine des opérateurs — Accepter ou rejeter les candidatures
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Total Sessions
          </div>
          <div className="text-3xl font-semibold text-gray-800 mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Operational
          </div>
          <div className="text-3xl font-semibold text-green-700 mt-2">
            {stats.operational}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Awaiting Staffing
          </div>
          <div className="text-3xl font-semibold text-orange-700 mt-2">
            {stats.awaiting}
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
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Procédure:</strong> Examinez chaque candidature en attente et cliquez
            sur "Accepter" ou "Rejeter". Les candidatures acceptées compteront vers le total
            requis d'opérateurs.
          </p>
        </div>
      )}
    </div>
  );
}
