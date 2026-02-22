import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/common/StatusBadge';

/**
 * SessionOperatorsList — Operator Applications List
 *
 * Displays three sections:
 * - ACCEPTED operators
 * - PENDING applications
 * - REJECTED applications
 *
 * ROLE-BASED ACTIONS:
 * - Enterprise: See [Accept] [Reject] buttons on PENDING applications
 * - Operator & Client: Read-only view
 *
 * NO business logic, NO automation
 * All mutations go through MarketplaceController
 */

interface Operator {
  operatorId: string;
  name: string;
  email?: string;
  appliedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface SessionOperatorsListProps {
  sessionId: string;
  accepted: Operator[];
  pending: Operator[];
  rejected: Operator[];
  isEnterprise: boolean;
  onAction?: (actionType: string, sessionId: string, operatorId: string) => void;
}

export default function SessionOperatorsList({
  sessionId,
  accepted,
  pending,
  rejected,
  isEnterprise,
  onAction
}: SessionOperatorsListProps) {
  const { toast } = useToast();
  const [loadingActions, setLoadingActions] = useState<{
    [key: string]: boolean;
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ============================================================
  // HANDLE ACCEPT/REJECT ACTIONS
  // ============================================================

  const handleAccept = async (operatorId: string) => {
    setLoadingActions(prev => ({
      ...prev,
      [`accept_${operatorId}`]: true
    }));
    setErrors(prev => ({
      ...prev,
      [operatorId]: ''
    }));

    try {
      const result = (window as any).MarketplaceController?.acceptOperator(
        sessionId,
        operatorId
      );

      if (result && result.success) {
        toast({
          title: 'Opérateur accepté',
          description: 'L\'opérateur a été accepté avec succès.',
          variant: 'default'
        });
        if (onAction) {
          onAction('accept', sessionId, operatorId);
        }
      } else {
        const errorMsg = result?.error || 'Failed to accept operator';
        toast({
          title: 'Erreur',
          description: errorMsg,
          variant: 'destructive'
        });
        setErrors(prev => ({
          ...prev,
          [operatorId]: errorMsg
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive'
      });
      setErrors(prev => ({
        ...prev,
        [operatorId]: errorMsg
      }));
    } finally {
      setLoadingActions(prev => ({
        ...prev,
        [`accept_${operatorId}`]: false
      }));
    }
  };

  const handleReject = async (operatorId: string) => {
    setLoadingActions(prev => ({
      ...prev,
      [`reject_${operatorId}`]: true
    }));
    setErrors(prev => ({
      ...prev,
      [operatorId]: ''
    }));

    try {
      const result = (window as any).MarketplaceController?.rejectOperator(
        sessionId,
        operatorId
      );

      if (result && result.success) {
        toast({
          title: 'Opérateur rejeté',
          description: 'L\'opérateur a été rejeté avec succès.',
          variant: 'default'
        });
        if (onAction) {
          onAction('reject', sessionId, operatorId);
        }
      } else {
        const errorMsg = result?.error || 'Failed to reject operator';
        toast({
          title: 'Erreur',
          description: errorMsg,
          variant: 'destructive'
        });
        setErrors(prev => ({
          ...prev,
          [operatorId]: errorMsg
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive'
      });
      setErrors(prev => ({
        ...prev,
        [operatorId]: errorMsg
      }));
    } finally {
      setLoadingActions(prev => ({
        ...prev,
        [`reject_${operatorId}`]: false
      }));
    }
  };

  // ============================================================
  // OPERATOR ROW COMPONENT
  // ============================================================

  const OperatorRow = ({
    operator,
    status
  }: {
    operator: Operator;
    status: 'accepted' | 'pending' | 'rejected';
  }) => {
    const statusColors = {
      accepted: 'bg-card border-border',
      pending: 'bg-yellow-50 border-yellow-200',
      rejected: 'bg-card border-border'
    };

    const statusBadgeColors = {
      accepted: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700'
    };

    const statusLabels = {
      accepted: 'Accepté',
      pending: 'En attente',
      rejected: 'Rejeté'
    };

    const dateField = {
      accepted: operator.acceptedAt,
      pending: operator.appliedAt,
      rejected: operator.rejectedAt
    };

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const isLoading =
      loadingActions[`accept_${operator.operatorId}`] ||
      loadingActions[`reject_${operator.operatorId}`];
    const hasError = errors[operator.operatorId];

    return (
      <div
        key={operator.operatorId}
        className={`rounded-lg border-2 p-4 ${statusColors[status]}`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Operator Info */}
          <div className="flex-1">
            <div className="font-semibold text-gray-800">
              {operator.name}
            </div>
            {operator.email && (
              <div className="text-xs text-gray-600 mt-1">
                {operator.email}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={status} type="staffing" size="sm" />
              <span className="text-xs text-muted-foreground">
                {formatDate(dateField[status])}
              </span>
            </div>

            {/* Error Message */}
            {hasError && (
              <div className="text-xs text-red-600 mt-2 bg-card p-2 rounded">
                {hasError}
              </div>
            )}
          </div>

          {/* Actions (Enterprise only, Pending status only) */}
          {isEnterprise && status === 'pending' && (
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => handleAccept(operator.operatorId)}
                disabled={isLoading}
                className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingActions[`accept_${operator.operatorId}`]
                  ? 'Acceptation...'
                  : 'Accepter'}
              </button>
              <button
                onClick={() => handleReject(operator.operatorId)}
                disabled={isLoading}
                className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingActions[`reject_${operator.operatorId}`]
                  ? 'Rejet...'
                  : 'Rejeter'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (accepted.length === 0 && pending.length === 0 && rejected.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-muted-foreground">
          Aucune candidature pour cette session
        </p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Candidatures d'Opérateurs
      </h2>

      <div className="space-y-6">
        {/* ACCEPTED SECTION */}
        {accepted.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
              Acceptés ({accepted.length})
            </h3>
            <div className="space-y-2">
              {accepted.map(op => (
                <OperatorRow key={op.operatorId} operator={op} status="accepted" />
              ))}
            </div>
          </div>
        )}

        {/* PENDING SECTION */}
        {pending.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full"></span>
              En Attente ({pending.length})
            </h3>
            <div className="space-y-2">
              {pending.map(op => (
                <OperatorRow key={op.operatorId} operator={op} status="pending" />
              ))}
            </div>
          </div>
        )}

        {/* REJECTED SECTION */}
        {rejected.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              Rejetés ({rejected.length})
            </h3>
            <div className="space-y-2">
              {rejected.map(op => (
                <OperatorRow key={op.operatorId} operator={op} status="rejected" />
              ))}
            </div>
          </div>
        )}
      </div>

      {isEnterprise && pending.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 Acceptez ou rejetez les candidatures en attente
          </p>
        </div>
      )}
    </div>
  );
}
