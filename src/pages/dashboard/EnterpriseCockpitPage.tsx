import React, { useEffect, useState } from 'react';
import PlanningSessionCard from '@/components/planning/PlanningSessionCard';

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

  // ============================================================
  // FETCH DATA FROM PlanningStateService
  // ============================================================

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Get all planning sessions without filters
      const result = (window as any).Domain?.PlanningStateService?.getPlanningSessions();

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
    const colorStyles = {
      orange: 'bg-orange-50 border-orange-200',
      green: 'bg-green-50 border-green-200',
      blue: 'bg-blue-50 border-blue-200',
      orange_text: 'text-orange-700',
      green_text: 'text-green-700',
      blue_text: 'text-blue-700'
    };

    const colorMap = {
      orange: { bg: colorStyles['orange'], text: colorStyles['orange_text'] },
      green: { bg: colorStyles['green'], text: colorStyles['green_text'] },
      blue: { bg: colorStyles['blue'], text: colorStyles['blue_text'] }
    };

    const currentColor = colorMap[color as keyof typeof colorMap] || colorMap.orange;

    return (
      <div className="flex flex-col gap-4">
        <div className={`rounded-lg border p-4 ${currentColor.bg}`}>
          <h2 className={`text-lg font-semibold ${currentColor.text}`}>
            {title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {subtitle} ({sessionList.length})
          </p>
        </div>

        {sessionList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No sessions in this category.
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
            Vue synthèse des sessions en attente et opérationnelles
          </p>
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
        <div className="text-center py-8 text-gray-500">
          Loading sessions...
        </div>
      )}

      {/* COCKPIT SECTIONS */}
      {!loading && (
        <div className="flex flex-col gap-12">
          {/* SECTION 1: AWAITING STAFFING */}
          {renderSection(
            '⚠ Sessions Awaiting Staffing',
            'Staffing not yet complete',
            categorizedSessions.awaitingStaffing,
            'orange'
          )}

          {/* SECTION 2: OPERATIONAL */}
          {renderSection(
            '✓ Operational Sessions',
            'Ready for execution',
            categorizedSessions.operational,
            'green'
          )}

          {/* SECTION 3: PENDING CONFIRMATION */}
          {renderSection(
            '⏳ Pending Confirmation',
            'Awaiting client or admin confirmation',
            categorizedSessions.pendingConfirmation,
            'blue'
          )}
        </div>
      )}
    </div>
  );
}
