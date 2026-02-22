import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSessionPlanningDetailsSafe } from '@/services/planningBridge.service';

/**
 * SessionDetailPageV2 — Safe, Robust Session Detail View
 *
 * Architecture:
 * - Uses ONLY bridge service (planningBridge.service.ts)
 * - Never accesses window.Domain directly
 * - Graceful fallback if service unavailable
 * - Pure UI rendering
 * - No complex state management
 *
 * This is a REFACTORED version that eliminates dependency on
 * unstable Domain runtime initialization.
 */

interface SessionDetail {
  id: string;
  date: string;
  clientId: string;
  status: string;
  marketplaceVisible: boolean;
  setupIds: string[];
  notes?: string;
}

export default function SessionDetailPageV2() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState<any>({ accepted: [], pending: [], rejected: [] });
  const [staffingState, setStaffingState] = useState<any>(null);

  // ============================================================
  // FETCH SESSION DETAILS VIA BRIDGE
  // ============================================================

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Use bridge service only — graceful null fallback
      const result = getSessionPlanningDetailsSafe(sessionId);

      if (!result) {
        // Service unavailable — show neutral loading state
        setSession(null);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSession(result.session || null);
        setOperators(result.operators || { accepted: [], pending: [], rejected: [] });
        setStaffingState(result.staffingState || null);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('[SessionDetail] Error loading session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="text-center py-16 text-muted-foreground">
          Chargement de la session...
        </div>
      </div>
    );
  }

  // ============================================================
  // SESSION NOT FOUND STATE
  // ============================================================

  if (!session) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="text-center py-16 text-muted-foreground">
          Session not found or unavailable
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: SESSION HEADER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Session {sessionId}
            </h1>
            <p className="text-muted-foreground mt-1">
              Client: {session.clientId}
            </p>
          </div>
          <Badge variant="default">
            {session.status}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: SESSION INFO */}
        <div className="lg:col-span-1 space-y-4">
          {/* Date & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Date & Lieu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {new Date(session.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {session.setupIds.length > 0 && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {session.setupIds.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staffing Info */}
          {staffingState && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Affectations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Opérateurs requis:</span>
                  <span className="font-medium">{staffingState.minOperators}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acceptés:</span>
                  <span className="font-medium text-green-600">
                    {staffingState.acceptedCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">En attente:</span>
                  <span className="font-medium text-blue-600">
                    {staffingState.pendingCount}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">État:</span>
                  <Badge
                    variant={staffingState.isOperational ? 'default' : 'secondary'}
                  >
                    {staffingState.isOperational ? 'Opérationnelle' : 'Incomplète'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: OPERATORS LIST */}
        <div className="lg:col-span-2 space-y-4">
          {/* Accepted Operators */}
          {operators.accepted.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Opérateurs Confirmés ({operators.accepted.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {operators.accepted.map((op: any) => (
                    <div
                      key={op.operatorId}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div>
                        <p className="font-medium text-sm">{op.name}</p>
                        <p className="text-xs text-muted-foreground">{op.email}</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Accepté
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Operators */}
          {operators.pending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  En Attente ({operators.pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {operators.pending.map((op: any) => (
                    <div
                      key={op.operatorId}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div>
                        <p className="font-medium text-sm">{op.name}</p>
                        <p className="text-xs text-muted-foreground">{op.email}</p>
                      </div>
                      <Badge variant="secondary">En attente</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Operators */}
          {operators.accepted.length === 0 && operators.pending.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <p>Aucun opérateur pour cette session</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {session.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {session.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
