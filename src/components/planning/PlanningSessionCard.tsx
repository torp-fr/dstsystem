import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  showQuickActions?: boolean;
}

export default function PlanningSessionCard({ session, showQuickActions }: PlanningSessionCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (!session?.id) return;
    navigate(`/dashboard/sessions/${session.id}`);
  };

  // ============================================================
  // OPERATIONAL STATE & BADGE
  // ============================================================

  const getOperationalBadge = () => {
    const isOperational = session.staffing.isOperational;
    const accepted = session.staffing.acceptedOperators;
    const required = session.staffing.minOperators;
    const pending = session.staffing.pendingApplications;

    if (isOperational) {
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
      className="group bg-card rounded-2xl shadow-sm border border-border p-4 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* SECTION 1: DATE (PROMINENT) */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xl font-bold text-foreground">
          {new Date(session.date).toLocaleDateString('fr-FR', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        {session.marketplaceVisible && (
          <span className="text-xs font-medium px-2 py-1 rounded bg-purple-600/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            Marketplace
          </span>
        )}
      </div>

      {/* SECTION 2: REGION & CLIENT */}
      <div className="flex flex-col gap-1 text-sm">
        <div className="text-muted-foreground capitalize">
          Région: <span className="font-medium text-foreground">{session.regionId}</span>
        </div>
        <div className="text-muted-foreground">
          Client: <span className="font-medium text-foreground">{session.clientId}</span>
        </div>
      </div>

      {/* SECTION 3: STAFFING STATUS */}
      <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Opérateurs confirmés:</span>
          <span className="font-semibold text-foreground">
            {session.staffing.acceptedOperators}/{session.staffing.minOperators}
          </span>
        </div>

        {session.staffing.pendingApplications > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Candidatures en attente:</span>
            <span className="font-semibold text-foreground">
              {session.staffing.pendingApplications}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 4: OPERATIONAL STATE BADGE */}
      <div className={`text-center py-2 px-3 rounded-lg font-medium text-sm border ${badge.className}`}>
        {badge.label}
      </div>

      {/* SECTION 5: STATUS METADATA */}
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <StatusBadge status={session.status} type="session" size="sm" />
      </div>

      {/* SECTION 6: QUICK ACTIONS */}
      {showQuickActions && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/sessions/${session.id}`);
            }}
          >
            Ouvrir
          </Button>

          {session.status === 'pending_confirmation' && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/sessions/${session.id}?action=confirm`);
              }}
            >
              Valider
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
