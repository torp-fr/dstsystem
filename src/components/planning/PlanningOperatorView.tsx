import React, { useEffect, useState } from 'react';

/**
 * PlanningOperatorView — Operator Schedule View
 *
 * PURE UI LAYER:
 * - Reads ONLY from Domain.PlanningStateService.getOperatorPlanning()
 * - Shows operator's accepted sessions only
 * - NO staffing display, NO marketplace info, NO actions
 * - Simple read-only schedule view
 */

interface UpcomingSession {
  sessionId: string;
  date: string;
  regionId: string;
  clientId: string;
  status: string;
  acceptedAt: string;
}

interface PlanningOperatorViewProps {
  operatorId: string;
}

export default function PlanningOperatorView({ operatorId }: PlanningOperatorViewProps) {
  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH OPERATOR PLANNING
  // ============================================================

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const result = (window as any).Domain?.PlanningStateService?.getOperatorPlanning(operatorId);

      if (!result) {
        setError('Service not initialized');
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSessions(result.upcomingSessions || []);
      } else {
        setError(result.error || 'Failed to load schedule');
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [operatorId]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* TITLE */}
      <h2 className="text-lg font-semibold text-gray-800">
        Mes Sessions Confirmées
      </h2>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading schedule...
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && sessions.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400">
          No confirmed sessions yet.
        </div>
      )}

      {/* SESSIONS LIST */}
      {!loading && sessions.length > 0 && (
        <div className="flex flex-col gap-3">
          {sessions.map(session => (
            <div
              key={session.sessionId}
              className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between"
            >
              {/* LEFT SIDE */}
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {new Date(session.date).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {session.regionId} • {session.clientId}
                </div>
              </div>

              {/* ACCEPTED DATE BADGE */}
              <div className="text-xs text-gray-500 text-right">
                <div className="font-medium">Accepted</div>
                <div className="text-gray-400">
                  {new Date(session.acceptedAt).toLocaleDateString('fr-FR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
