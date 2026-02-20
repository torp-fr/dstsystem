import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/common/StatusBadge';

/**
 * PlanningSessionCard — Individual Session Display
 *
 * PURE UI LAYER:
 * - Displays session data from props
 * - Clickable card navigates to session detail
 * - NO business logic, NO mutations
 */

interface SessionStaffing {
  minOperators: number;
  acceptedOperators: number;
  pendingApplications: number;
  isOperational: boolean;
}

interface PlanningSessionCardProps {
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
}

export default function PlanningSessionCard({ session }: PlanningSessionCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (!session?.id) return;
    navigate(`/dashboard/sessions/${session.id}`);
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
  // OPERATIONAL BADGE
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
          <StatusBadge status={session.status} type="session" size="sm" />

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

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Required Operators:</span>
          <span className="font-semibold text-gray-800">
            {session.staffing.minOperators}
          </span>
        </div>
      </div>

      {/* OPERATIONAL BADGE */}
      <div className={`text-center py-2 rounded-lg font-medium text-sm ${operationalStyle}`}>
        {operationalLabel}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div>Client: {session.clientId}</div>
          <div className="text-gray-400 mt-1">{session.id}</div>
        </div>
      </div>
    </div>
  );
}
