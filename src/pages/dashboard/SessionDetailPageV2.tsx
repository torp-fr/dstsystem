import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSessionPlanningDetailsSafe } from '@/services/planningBridge.service';
import { useQuotes, type Quote } from '@/hooks/useQuotes';

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
  const [searchParams] = useSearchParams();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState<any>({ accepted: [], pending: [], rejected: [] });
  const [staffingState, setStaffingState] = useState<any>(null);
  const [businessData, setBusinessData] = useState<Quote | null>(null);

  // Assign mode detection
  const assignMode = searchParams.get('action') === 'assign';
  const operatorsRef = useRef<HTMLDivElement | null>(null);

  // Fetch quotes to find one linked to this session
  const { data: quotes = [] } = useQuotes();

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

        // Find quote linked to this session
        const linkedQuote = quotes.find((q: Quote) => q.session_id === sessionId);
        setBusinessData(linkedQuote || null);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('[SessionDetail] Error loading session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, quotes]);

  // ============================================================
  // ASSIGN MODE — Auto-scroll to operators section
  // ============================================================

  useEffect(() => {
    if (assignMode && operatorsRef.current) {
      operatorsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [assignMode]);

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

      {/* Assign Mode Context Banner */}
      {assignMode && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Mode Affectation opérateurs actif
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: OPERATIONAL INFO */}
        <div className="lg:col-span-1 space-y-4">
          {/* Operational Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Opérationnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="font-medium text-sm">
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
                    <p className="text-xs text-muted-foreground mb-1">Modules</p>
                    <p className="text-sm text-muted-foreground">
                      {session.setupIds.join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {staffingState && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Affectations</p>
                  <Badge
                    variant={staffingState.isOperational ? 'default' : 'secondary'}
                    className="w-full text-center justify-center"
                  >
                    {staffingState.isOperational ? 'Opérationnelle' : 'Incomplète'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {staffingState.acceptedCount}/{staffingState.minOperators} opérateurs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Card (Mini) */}
          {businessData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Devis:</span>
                  <span className="font-medium">{businessData.quote_number}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    Montant
                  </span>
                  <span className="font-bold text-green-600">
                    {businessData.total_amount.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut:</span>
                  <Badge variant="outline" className="text-xs">
                    {businessData.status === 'draft' && 'Brouillon'}
                    {businessData.status === 'sent' && 'Envoyé'}
                    {businessData.status === 'accepted' && 'Accepté'}
                    {businessData.status === 'rejected' && 'Rejeté'}
                    {businessData.status === 'converted_to_invoice' && 'Facturé'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: OPERATORS SECTION */}
        <div
          ref={operatorsRef}
          className={`lg:col-span-2 space-y-4 ${assignMode ? 'ring-2 ring-amber-400 transition-all duration-500 p-4 rounded-lg' : ''}`}
        >
          {/* Operators Header */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              Opérateurs
            </h3>

            {/* Staffing Pressure Indicator */}
            {assignMode && session?.staffing && (
              <p className="text-xs text-muted-foreground mb-3">
                {session.staffing.acceptedOperators}/{session.staffing.minOperators} opérateurs confirmés
              </p>
            )}

            {/* Assign Mode Action Header */}
            {assignMode && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-amber-700">
                  Affectation rapide des opérateurs
                </p>
              </div>
            )}

            {/* Operators Content Container */}
            <div className={`space-y-4 ${
              assignMode ? 'bg-amber-50/40 rounded-xl p-4' : ''
            }`}>
              {operators.accepted.length === 0 && operators.pending.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground py-12">
                    <p>Aucun opérateur pour cette session</p>
                  </CardContent>
                </Card>
              )}

              {/* Accepted Operators */}
              {operators.accepted.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-green-600 mb-2">
                    Confirmés ({operators.accepted.length})
                  </p>
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
                </div>
              )}

              {/* Pending Operators */}
              {operators.pending.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    En Attente ({operators.pending.length})
                  </p>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>
  );
}
