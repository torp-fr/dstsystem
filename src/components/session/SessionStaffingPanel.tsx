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

  const operationalStyle = isOperational
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';
  const operationalLabel = isOperational ? '✓ OPÉRATIONNEL' : '⚠ EN ATTENTE';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        État du Staffing
      </h2>

      {/* Staffing Stats Grid */}
      <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Opérateurs Requis</span>
          <span className="text-lg font-semibold text-gray-800">
            {minOperators}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
          <span className="text-sm text-gray-600">Acceptés</span>
          <span className="text-lg font-semibold text-green-700">
            {acceptedCount}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
          <span className="text-sm text-gray-600">En Attente</span>
          <span className="text-lg font-semibold text-yellow-700">
            {pendingCount}
          </span>
        </div>
      </div>

      {/* Operational Status Badge */}
      <div className={`text-center py-3 rounded-lg font-medium text-sm ${operationalStyle}`}>
        {operationalLabel}
      </div>

      {/* Status Message */}
      {!isOperational && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          {minOperators - acceptedCount} opérateur(s) supplémentaire(s) nécessaire(s)
        </p>
      )}

      {isOperational && (
        <p className="text-xs text-green-600 mt-3 text-center">
          Tous les opérateurs requis sont confirmés
        </p>
      )}
    </div>
  );
}
