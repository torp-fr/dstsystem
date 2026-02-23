import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/common/EmptyState';
import SkeletonTable from '@/components/common/SkeletonTable';
import { getPlanningSessionsSafe } from '@/services/planningBridge.service';
import StatusBadge from '@/components/common/StatusBadge';

/**
 * SessionsOperationalView — Table-based Operational Sessions View
 *
 * PURE UI LAYER:
 * - Reads ONLY from Domain.PlanningStateService
 * - NO business logic, automation, or predictions
 * - Displays state only
 * - Emits events for detail modal, assign, edit actions
 */

interface SessionStaffing {
  minOperators: number;
  acceptedOperators: number;
  pendingApplications: number;
  isOperational: boolean;
}

interface PlanningSession {
  id: string;
  date: string;
  regionId: string;
  clientId: string;
  status: string;
  marketplaceVisible: boolean;
  setupIds: string[];
  staffing: SessionStaffing;
}

interface SessionsOperationalViewProps {
  onSessionClick: (session: PlanningSession) => void;
  onAssignClick: (sessionId: string) => void;
  onEditClick: (sessionId: string) => void;
}

export default function SessionsOperationalView({
  onSessionClick,
  onAssignClick,
  onEditClick,
}: SessionsOperationalViewProps) {
  const [sessions, setSessions] = useState<PlanningSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH DATA FROM PlanningStateService
  // ============================================================

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('[SessionsOperational] Fetching sessions from PlanningStateService...');
        // Call service (no filters for full view)
        const result = await getPlanningSessionsSafe({});
        console.log('[SessionsOperational] Result:', result.sessions?.length || 0, 'sessions');

        if (result.success) {
          setSessions(result.sessions || []);
          console.log('[SessionsOperational] ✓ Sessions loaded');
        } else {
          setError(result.error || 'Impossible de charger les sessions');
          setSessions([]);
        }
      } catch (err) {
        console.error('[SessionsOperational] Error:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return <SkeletonTable rows={8} />;
  }

  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
        {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucune session trouvée"
        description="Créez une nouvelle session pour commencer."
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-card border-b border-border sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left font-medium text-muted-foreground">
              Date
            </th>
            <th className="px-6 py-3 text-left font-medium text-muted-foreground">
              Client
            </th>
            <th className="px-6 py-3 text-left font-medium text-muted-foreground">
              Région
            </th>
            <th className="px-6 py-3 text-left font-medium text-muted-foreground">
              Modules
            </th>
            <th className="px-6 py-3 text-left font-medium text-muted-foreground">
              Staffing
            </th>
            <th className="px-6 py-3 text-left font-medium text-muted-foreground">
              Statut
            </th>
            <th className="px-6 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sessions.map((session) => {
            const isIncomplete = !session.staffing.isOperational;

            return (
              <tr
                key={session.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {/* Date */}
                <td
                  className="px-6 py-4 font-medium text-foreground"
                  onClick={() => onSessionClick(session)}
                >
                  {new Date(session.date).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Client */}
                <td
                  className="px-6 py-4 text-foreground"
                  onClick={() => onSessionClick(session)}
                >
                  {session.clientId}
                </td>

                {/* Région */}
                <td
                  className="px-6 py-4 text-muted-foreground"
                  onClick={() => onSessionClick(session)}
                >
                  {session.regionId}
                </td>

                {/* Modules */}
                <td
                  className="px-6 py-4 text-muted-foreground"
                  onClick={() => onSessionClick(session)}
                >
                  {session.setupIds.length > 0
                    ? session.setupIds.join(', ')
                    : '—'}
                </td>

                {/* Staffing */}
                <td
                  className="px-6 py-4"
                  onClick={() => onSessionClick(session)}
                >
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={
                        session.staffing.isOperational ? 'default' : 'secondary'
                      }
                      className="w-fit"
                    >
                      {session.staffing.acceptedOperators}/
                      {session.staffing.minOperators}
                    </Badge>
                    {isIncomplete && (
                      <span className="text-xs text-destructive font-medium">
                        Manquants
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td
                  className="px-6 py-4"
                  onClick={() => onSessionClick(session)}
                >
                  <StatusBadge status={session.status} type="session" size="sm" />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick(session);
                      }}
                    >
                      Détails
                    </Button>

                    {isIncomplete && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignClick(session.id);
                        }}
                      >
                        Affecter
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(session.id);
                      }}
                    >
                      Éditer
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
