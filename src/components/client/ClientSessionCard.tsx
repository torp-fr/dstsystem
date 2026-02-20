import React from 'react';
import { useNavigate } from 'react-router-dom';

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

  const isOperational = session.isOperational;
  const operationalStyle = isOperational
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';
  const operationalLabel = isOperational ? '✓ OPÉRATIONNEL' : '⚠ EN ATTENTE';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      onClick={() => navigate(`/dashboard/sessions/${session.sessionId}`)}
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
        </div>

        <div className="flex flex-col gap-2 items-end">
          {/* Status Badge */}
          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(session.status)}`}>
            {getStatusLabel(session.status)}
          </span>

          {/* Marketplace Badge */}
          {session.marketplaceVisible && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-700">
              Public
            </span>
          )}
        </div>
      </div>

      {/* STAFFING BLOCK */}
      <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Opérateurs Requis:</span>
          <span className="font-semibold text-gray-800">
            {session.minRequired}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Acceptés:</span>
          <span className="font-semibold text-green-700">
            {session.operatorCount}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">En Attente:</span>
          <span className="font-semibold text-yellow-700">
            {session.pendingApplications}
          </span>
        </div>
      </div>

      {/* OPERATIONAL STATUS */}
      <div className={`text-center py-2 rounded-lg font-medium text-sm ${operationalStyle}`}>
        {operationalLabel}
      </div>

      {/* FOOTER */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div>Session: {session.sessionId}</div>
        {session.status === 'pending_confirmation' && (
          <div className="text-gray-400 mt-1">En attente de confirmation</div>
        )}
        {session.status === 'confirmed' && !session.isOperational && (
          <div className="text-gray-400 mt-1">Collecte des candidatures en cours</div>
        )}
        {session.isOperational && (
          <div className="text-green-600 mt-1 font-medium">Staffing validé ✓</div>
        )}
      </div>
    </div>
  );
}
