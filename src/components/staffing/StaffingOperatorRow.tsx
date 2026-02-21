import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';

/**
 * StaffingOperatorRow — Individual Operator Application
 *
 * Shows operator details and ACCEPT/REJECT buttons for pending applications
 */

interface StaffingOperatorRowProps {
  operator: {
    operatorId: string;
    name: string;
    email?: string;
    appliedAt: string;
    acceptedAt?: string;
    rejectedAt?: string;
    status: 'accepted' | 'pending' | 'rejected';
  };
  sessionId: string;
  onAction: () => void;
}

export default function StaffingOperatorRow({
  operator,
  sessionId,
  onAction
}: StaffingOperatorRowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric'
    });
  };

  // ============================================================
  // HANDLE ACCEPT
  // ============================================================

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    setError(null);

    try {
      const result = (window as any).MarketplaceController?.acceptOperator(
        sessionId,
        operator.operatorId
      );

      if (result && result.success) {
        // Trigger parent refresh
        onAction();
      } else {
        setError(result?.error || 'Failed to accept operator');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // HANDLE REJECT
  // ============================================================

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    setError(null);

    try {
      const result = (window as any).MarketplaceController?.rejectOperator(
        sessionId,
        operator.operatorId
      );

      if (result && result.success) {
        // Trigger parent refresh
        onAction();
      } else {
        setError(result?.error || 'Failed to reject operator');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  const appliedDate = formatDate(operator.appliedAt);
  const statusDate = operator.acceptedAt || operator.rejectedAt || operator.appliedAt;
  const statusDateFormatted = formatDate(statusDate);

  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {operator.name}
          </div>
          {operator.email && (
            <div className="text-xs text-muted-foreground truncate">{operator.email}</div>
          )}
        </div>

        <div className="flex-shrink-0">
          <StatusBadge status={operator.status} type="staffing" size="sm" />
        </div>
      </div>

      {/* DATES */}
      <div className="flex justify-between text-xs text-muted-foreground mb-3">
        <span>Candidature: {appliedDate}</span>
        {operator.status !== 'pending' && (
          <span>
            {operator.status === 'accepted' ? 'Confirmé' : 'Refusé'}:{' '}
            {statusDateFormatted}
          </span>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-destructive/5 border border-destructive/30 rounded p-2 text-destructive text-xs mb-2">
          {error}
        </div>
      )}

      {/* ACTION BUTTONS (ONLY IF PENDING) */}
      {operator.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isProcessing ? 'Processing...' : 'Confirmer'}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            {isProcessing ? 'Processing...' : 'Refuser'}
          </Button>
        </div>
      )}
    </div>
  );
}
