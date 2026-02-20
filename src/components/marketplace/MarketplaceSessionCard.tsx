import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import MarketplaceApplicationBadge from './MarketplaceApplicationBadge';

/**
 * MarketplaceSessionCard — Individual Marketplace Session
 *
 * PURE UI LAYER:
 * - Displays session data
 * - Shows apply button if not applied
 * - Shows application status if already applied
 * - Handles apply action via MarketplaceController
 */

interface SessionStaffing {
  minOperators: number;
  acceptedOperators: number;
  pendingApplications: number;
  isOperational: boolean;
}

interface MarketplaceSessionCardProps {
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
  onApply: (sessionId: string) => void;
}

export default function MarketplaceSessionCard({
  session,
  onApply
}: MarketplaceSessionCardProps) {
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOperatorId, setCurrentOperatorId] = useState<string | null>(null);

  // ============================================================
  // GET CURRENT OPERATOR & CHECK APPLICATION STATUS
  // ============================================================

  useEffect(() => {
    try {
      // Get current operator ID
      const account = (window as any).Domain?.AccountRepository?.getCurrentAccount();
      if (account && account.operator_id) {
        setCurrentOperatorId(account.operator_id);

        // Check if operator has applied
        // This would typically come from session details endpoint
        // For now, we assume if applying fails, we know they haven't applied
      }
    } catch (err) {
      console.error('Error getting current operator:', err);
    }
  }, []);

  // ============================================================
  // HANDLE APPLY ACTION
  // ============================================================

  const handleApply = async () => {
    if (!currentOperatorId) {
      setError('Operator ID not found');
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      // Call MarketplaceController to apply
      const result = (window as any).MarketplaceController?.applyToSession(
        session.id,
        currentOperatorId
      );

      if (result && result.success) {
        setHasApplied(true);
        setApplicationStatus('pending');
        onApply(session.id);
      } else {
        setError(result?.error || 'Failed to apply to session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsApplying(false);
    }
  };

  // ============================================================
  // STATUS BADGE COLORS
  // ============================================================

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return 'bg-gray-100 text-gray-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ============================================================
  // OPERATIONAL STATE
  // ============================================================

  const isOperational = session.staffing.isOperational;
  const operationalStyle = isOperational
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';
  const operationalLabel = isOperational ? 'OPERATIONAL' : 'AWAITING STAFFING';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4">
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
          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeStyle(session.status)}`}>
            {getStatusLabel(session.status)}
          </span>

          {/* Marketplace Badge */}
          {session.marketplaceVisible && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-700">
              Marketplace
            </span>
          )}
        </div>
      </div>

      {/* STAFFING BLOCK */}
      <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Required Operators:</span>
          <span className="font-semibold text-gray-800">
            {session.staffing.minOperators}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Accepted Operators:</span>
          <span className="font-semibold text-gray-800">
            {session.staffing.acceptedOperators}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pending Applications:</span>
          <span className="font-semibold text-gray-800">
            {session.staffing.pendingApplications}
          </span>
        </div>
      </div>

      {/* OPERATIONAL BADGE */}
      <div className={`text-center py-2 rounded-lg font-medium text-sm ${operationalStyle}`}>
        {operationalLabel}
      </div>

      {/* CLIENT INFO */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div>Client: {session.clientId}</div>
        <div className="text-gray-400 mt-1">{session.id}</div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* ACTION SECTION */}
      <div className="pt-4 border-t border-gray-100">
        {hasApplied ? (
          // Show application status badge
          <MarketplaceApplicationBadge status={applicationStatus || 'pending'} />
        ) : (
          // Show apply button
          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {isApplying ? 'Applying...' : 'Apply to Session'}
          </Button>
        )}
      </div>
    </div>
  );
}
