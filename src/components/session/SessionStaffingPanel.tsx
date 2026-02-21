import React from 'react';

/**
 * SessionStaffingPanel — Staffing State Display
 *
 * Displays:
 * - Min operators required
 * - Accepted operators count
 * - Pending applications count
 * - Operational status badge (green if staffed, orange if waiting)
 */

interface SessionStaffingPanelProps {
  minOperators: number;
  acceptedCount: number;
  pendingCount: number;
  isOperational: boolean;
}

export default function SessionStaffingPanel({
  minOperators,
  acceptedCount,
  pendingCount,
  isOperational
}: SessionStaffingPanelProps) {
  // ============================================================
  // OPERATIONAL STATUS BADGE
  // ============================================================

  const getOperationalBadge = () => {
    if (isOperational) {
      return {
        label: 'Prête à démarrer',
        className: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
      };
    } else {
      return {
        label: 'Opérateurs manquants',
        className: 'bg-destructive/10 text-destructive border border-destructive/20'
      };
    }
  };

  const badge = getOperationalBadge();

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Affectations
      </h2>

      {/* Staffing Stats Grid */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Opérateurs requis</span>
          <span className="text-lg font-semibold text-foreground">
            {minOperators}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Confirmés</span>
          <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            {acceptedCount}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">En attente de validation</span>
          <span className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {pendingCount}
          </span>
        </div>
      </div>

      {/* Operational Status Badge */}
      <div className={`text-center py-3 px-4 rounded-lg font-medium text-sm border ${badge.className}`}>
        {badge.label}
      </div>

      {/* Status Message */}
      {!isOperational && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {minOperators - acceptedCount} opérateur(s) supplémentaire(s) nécessaire(s)
        </p>
      )}

      {isOperational && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-3 text-center">
          Tous les opérateurs requis sont confirmés
        </p>
      )}
    </div>
  );
}
