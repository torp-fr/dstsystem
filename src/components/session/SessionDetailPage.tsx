import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SessionHeader from './SessionHeader';
import SessionMetaBlock from './SessionMetaBlock';
import SessionStaffingPanel from './SessionStaffingPanel';
import SessionOperatorsList from './SessionOperatorsList';

/**
 * SessionDetailPage — Unified Session Detail View
 *
 * Accessible by all roles: Enterprise, Operator, Client
 *
 * PURE UI LAYER:
 * - Reads ONLY from Domain.PlanningStateService.getSessionPlanningDetails
 * - Role-based visibility of actions via RoleGuardService
 * - Enterprise sees accept/reject buttons on PENDING applications
 * - Operator and Client see read-only view
 * - NO business logic, NO automation
 *
 * Data flow:
 * useParams → sessionId → Domain.PlanningStateService → Component state → Render
 * Action: User clicks button → MarketplaceController → Refresh data
 */

interface SessionState {
  id: string;
  date: string;
  clientId: string;
  status: string;
  marketplaceVisible: boolean;
  setupIds: string[];
  operatorRequirement?: {
    minOperators: number;
    preferredOperators?: number;
  };
  notes?: string;
}

interface Operator {
  operatorId: string;
  name: string;
  email?: string;
  appliedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface StaffingState {
  minOperators: number;
  acceptedCount: number;
  pendingCount: number;
  rejectedCount: number;
  isOperational: boolean;
}

export default function SessionDetailPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [session, setSession] = useState<SessionState | null>(null);
  const [operators, setOperators] = useState<{
    accepted: Operator[];
    pending: Operator[];
    rejected: Operator[];
  }>({ accepted: [], pending: [], rejected: [] });
  const [staffingState, setStaffingState] = useState<StaffingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ============================================================
  // DETERMINE USER ROLE
  // ============================================================

  const userRole = user?.user_metadata?.role || 'unknown';
  const isEnterprise = userRole === 'enterprise';

  // ============================================================
  // FETCH SESSION DETAILS
  // ============================================================

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call Domain service to get session details
      const result = (window as any).Domain?.PlanningStateService?.getSessionPlanningDetails(
        sessionId
      );

      if (!result) {
        // Runtime may be initializing — graceful fallback
        // Do NOT display as error; show neutral loading state instead
        setSession(null);
        setError(null);
        setOperators({ accepted: [], pending: [], rejected: [] });
        setStaffingState(null);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSession(result.session);
        setOperators(result.operators);
        setStaffingState(result.staffingState);
      } else {
        setError(result.error || 'Failed to load session');
        setSession(null);
        setOperators({ accepted: [], pending: [], rejected: [] });
        setStaffingState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSession(null);
      setOperators({ accepted: [], pending: [], rejected: [] });
      setStaffingState(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, refreshTrigger]);

  // ============================================================
  // HANDLE ACTION (ACCEPT/REJECT)
  // ============================================================

  const handleAction = (actionType: string, sessionId: string, operatorId: string) => {
    // Trigger refresh to reload data after action
    setRefreshTrigger(prev => prev + 1);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="text-center py-12 text-gray-500">
          Chargement de la session...
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR OR EMPTY STATE
  // ============================================================

  if (!session || !staffingState) {
    // If no session loaded — show neutral state (not red error)
    // This can happen during runtime initialization or if session doesn't exist
    return (
      <div className="flex flex-col gap-6 w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}
        {!error && (
          <div className="text-center py-12 text-gray-400">
            Session not found or still loading...
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* PAGE HEADER */}
      <SessionHeader
        date={session.date}
        status={session.status}
        marketplaceVisible={session.marketplaceVisible}
      />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Meta & Staffing */}
        <div className="lg:col-span-1 space-y-6">
          {/* Meta Block */}
          <SessionMetaBlock
            sessionId={session.id}
            clientId={session.clientId}
            notes={session.notes}
            setupIds={session.setupIds}
          />

          {/* Staffing Panel */}
          <SessionStaffingPanel
            minOperators={staffingState.minOperators}
            acceptedCount={staffingState.acceptedCount}
            pendingCount={staffingState.pendingCount}
            isOperational={staffingState.isOperational}
          />
        </div>

        {/* RIGHT COLUMN - Operators List */}
        <div className="lg:col-span-2">
          <SessionOperatorsList
            sessionId={session.id}
            accepted={operators.accepted}
            pending={operators.pending}
            rejected={operators.rejected}
            isEnterprise={isEnterprise}
            onAction={handleAction}
          />
        </div>
      </div>
    </div>
  );
}
