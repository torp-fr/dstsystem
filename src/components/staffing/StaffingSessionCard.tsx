import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffingOperatorRow from './StaffingOperatorRow';

/**
 * StaffingSessionCard — Individual Session with Operator Applications
 *
 * Displays:
 * - Session details (clickable → session detail page)
 * - Staffing state (required/accepted/pending)
 * - List of operators (accepted/pending/rejected)
 * - Operational status
 */

interface SessionStaffing {
  minOperators: number;
  acceptedOperators: number;
  pendingApplications: number;
  isOperational: boolean;
}

interface StaffingSessionCardProps {
  session: {
    id: string;
    date: string;
    regionId: string;
    clientId: string;
    status: string;
    marketplaceVisible: boolean;
    setupIds: string[];
    staffing: SessionStaffing;
  };
  onAction: () => void;
}

interface Operator {
  operatorId: string;
  name: string;
  email?: string;
  appliedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  status: 'accepted' | 'pending' | 'rejected';
}

export default function StaffingSessionCard({
  session,
  onAction
}: StaffingSessionCardProps) {
  const navigate = useNavigate();
  const [operators, setOperators] = useState<{
    accepted: Operator[];
    pending: Operator[];
    rejected: Operator[];
  }>({
    accepted: [],
    pending: [],
    rejected: []
  });
  const [loading, setLoading] = useState(false);

  // ============================================================
  // LOAD SESSION DETAILS (operators)
  // ============================================================

  useEffect(() => {
    setLoading(true);

    try {
      // Get detailed session info including all operators
      const result = (window as any).Domain?.PlanningStateService?.getSessionPlanningDetails(
        session.id
      );

      if (result && result.success) {
        setOperators({
          accepted: result.operators.accepted || [],
          pending: result.operators.pending || [],
          rejected: result.operators.rejected || []
        });
      }
    } catch (err) {
      console.error('Error loading session details:', err);
    } finally {
      setLoading(false);
    }
  }, [session.id]);

  // ============================================================
  // HANDLE NAVIGATION
  // ============================================================

  const handleNavigate = () => {
    if (!session?.id) return;
    navigate(`/dashboard/sessions/${session.id}`);
  };

  // ============================================================
  // OPERATIONAL STATUS
  // ============================================================

  const isOperational = session.staffing.isOperational;
  const operationalStyle = isOperational
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';
  const operationalLabel = isOperational
    ? '✓ SESSION OPÉRATIONNELLE'
    : '⚠ EN ATTENTE DE VALIDATION';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      onClick={handleNavigate}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-800">
            {new Date(session.date).toLocaleDateString('fr-FR', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-sm text-gray-600 mt-1 capitalize">
            {session.regionId}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {/* Status Badge */}
          <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
            Confirmed
          </span>

          {/* Marketplace Badge */}
          {session.marketplaceVisible && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-700">
              Marketplace
            </span>
          )}
        </div>
      </div>

      {/* STAFFING SUMMARY */}
      <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Required:</span>
          <span className="font-semibold text-gray-800">
            {session.staffing.minOperators}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Accepted:</span>
          <span className="font-semibold text-green-700">
            {session.staffing.acceptedOperators}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pending:</span>
          <span className="font-semibold text-yellow-700">
            {session.staffing.pendingApplications}
          </span>
        </div>
      </div>

      {/* OPERATIONAL BANNER */}
      <div className={`text-center py-2 rounded-lg font-medium text-sm ${operationalStyle}`}>
        {operationalLabel}
      </div>

      {/* CLIENT INFO */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-gray-100">
        <div>Client: {session.clientId}</div>
        <div className="text-muted-foreground mt-1">{session.id}</div>
      </div>

      {/* OPERATORS LIST */}
      {!loading && (
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
          {/* ACCEPTED OPERATORS */}
          {operators.accepted.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-green-700 uppercase mb-2">
                ✓ Accepted ({operators.accepted.length})
              </h4>
              <div className="space-y-2">
                {operators.accepted.map(op => (
                  <StaffingOperatorRow
                    key={op.operatorId}
                    operator={op}
                    sessionId={session.id}
                    onAction={onAction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PENDING OPERATORS */}
          {operators.pending.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-yellow-700 uppercase mb-2">
                ⏳ Pending ({operators.pending.length})
              </h4>
              <div className="space-y-2">
                {operators.pending.map(op => (
                  <StaffingOperatorRow
                    key={op.operatorId}
                    operator={op}
                    sessionId={session.id}
                    onAction={onAction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* REJECTED OPERATORS */}
          {operators.rejected.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-red-700 uppercase mb-2">
                ✗ Rejected ({operators.rejected.length})
              </h4>
              <div className="space-y-2">
                {operators.rejected.map(op => (
                  <StaffingOperatorRow
                    key={op.operatorId}
                    operator={op}
                    sessionId={session.id}
                    onAction={onAction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* NO APPLICATIONS */}
          {operators.accepted.length === 0 &&
            operators.pending.length === 0 &&
            operators.rejected.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No applications yet
              </div>
            )}
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Loading operators...
        </div>
      )}
    </div>
  );
}
