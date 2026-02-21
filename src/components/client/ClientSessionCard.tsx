import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/common/StatusBadge';

/**
 * ClientSessionCard — Client's Session Display
 *
 * Shows session details and staffing status
 * Clickable card navigates to session detail page
 */

interface ClientSessionCardProps {
  session: {
    sessionId: string;
    date: string;
    status: string;
    operatorCount: number;
    minRequired: number;
    isOperational: boolean;
    pendingApplications: number;
    marketplaceVisible: boolean;
  };
}

export default function ClientSessionCard({ session }: ClientSessionCardProps) {
  const navigate = useNavigate();

  // ============================================================
  // HANDLE NAVIGATION
  // ============================================================

  const handleNavigate = () => {
    if (!session?.sessionId) return;
    navigate(`/dashboard/sessions/${session.sessionId}`);
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusColor = (status: string) => {
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
  // OPERATIONAL STATUS
  // ============================================================

  const getOperationalBadge = () => {
    const isOp = session.isOperational;
    const accepted = session.operatorCount;
    const required = session.minRequired;
    const pending = session.pendingApplications;

    if (isOp) {
      return {
        label: 'Prête à démarrer',
        className: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
      };
    } else if (accepted < required) {
      return {
        label: 'Opérateurs manquants',
        className: 'bg-destructive/10 text-destructive border border-destructive/20'
      };
    } else if (pending > 0) {
      return {
        label: 'En validation',
        className: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
      };
    }
    return {
      label: 'Prête à démarrer',
      className: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
    };
  };

  // ============================================================
  // RENDER
  // ============================================================

  const badge = getOperationalBadge();

  return (
    <div
      onClick={handleNavigate}
      className="bg-card rounded-2xl shadow-sm border border-border p-4 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-lg font-semibold text-foreground">
            {new Date(session.date).toLocaleDateString('fr-FR', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {/* Status Badge */}
          <StatusBadge status={session.status} type="session" size="sm" />

          {/* Marketplace Badge */}
          {session.marketplaceVisible && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-purple-600/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              Public
            </span>
          )}
        </div>
      </div>

      {/* STAFFING BLOCK */}
      <div className="bg-card rounded-lg p-3 flex flex-col gap-2 border border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Opérateurs requis:</span>
          <span className="font-semibold text-foreground">
            {session.minRequired}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Confirmés:</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {session.operatorCount}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">En attente:</span>
          <span className="font-semibold text-blue-700 dark:text-blue-400">
            {session.pendingApplications}
          </span>
        </div>
      </div>

      {/* OPERATIONAL STATUS */}
      <div className={`text-center py-2 rounded-lg font-medium text-sm ${badge.className}`}>
        {badge.label}
      </div>

      {/* FOOTER */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
        <div>Session: {session.sessionId}</div>
        {session.status === 'pending_confirmation' && (
          <div className="text-muted-foreground mt-1">En attente de confirmation</div>
        )}
        {session.status === 'confirmed' && !session.isOperational && (
          <div className="text-muted-foreground mt-1">Collecte des candidatures en cours</div>
        )}
        {session.isOperational && (
          <div className="text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Staffing validé ✓</div>
        )}
      </div>
    </div>
  );
}
