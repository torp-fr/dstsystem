import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Calendar, MapPin, DollarSign, X } from 'lucide-react';
import { useQuotes, type Quote } from '@/hooks/useQuotes';
import { getSessionPlanningDetailsSafe } from '@/services/planningBridge.service';

/**
 * SessionDetailModal — Modal-based Session Detail View
 *
 * Replaces SessionDetailPageV2 route. Loads full session details
 * from PlanningStateService and displays in modal.
 *
 * PURE UI LAYER - no business logic modifications.
 */

interface SessionDetailModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (sessionId: string) => void;
  onAssign?: (sessionId: string) => void;
}

export default function SessionDetailModal({
  sessionId,
  isOpen,
  onClose,
  onEdit,
  onAssign,
}: SessionDetailModalProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<Quote | null>(null);

  // Fetch quotes to find one linked to this session
  const { data: quotes = [] } = useQuotes();

  // Load session details when modal opens or sessionId changes
  useEffect(() => {
    if (!isOpen || !sessionId) {
      setSession(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = getSessionPlanningDetailsSafe(sessionId);

      if (!result) {
        setError('Impossible de charger les détails de la session');
        setSession(null);
        return;
      }

      if (result.success && result.session) {
        setSession(result.session);
      } else {
        setError(result.error || 'Session non trouvée');
        setSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [isOpen, sessionId]);

  // Find linked quote
  useEffect(() => {
    if (session?.id) {
      const linkedQuote = quotes.find((q: Quote) => q.session_id === session.id);
      setBusinessData(linkedQuote || null);
    }
  }, [session?.id, quotes]);

  if (!isOpen) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Chargement des détails...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Erreur</DialogTitle>
          </DialogHeader>
          <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 text-destructive">
            {error || 'Session non trouvée'}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="ml-auto">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const staffing = session.staffing || {
    minOperators: 0,
    acceptedOperators: 0,
    pendingApplications: 0,
    isOperational: false,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Session {session.id}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Client: {session.clientId} • Région: {session.regionId}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Header Section */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(session.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {session.setupIds && session.setupIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.setupIds.join(', ')}</span>
                </div>
              )}
            </div>
            <Badge variant="default">{session.status}</Badge>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Operational Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Opérationnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Statut</p>
                  <Badge
                    variant={
                      staffing.isOperational ? 'default' : 'secondary'
                    }
                  >
                    {staffing.isOperational
                      ? 'Opérationnelle'
                      : 'Incomplète'}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Affectations
                  </p>
                  <p className="text-sm font-semibold">
                    {staffing.acceptedOperators}/
                    {staffing.minOperators} opérateurs
                  </p>
                  {staffing.pendingApplications > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {staffing.pendingApplications} candidatures en
                      attente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Info */}
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
                      {businessData.status === 'converted_to_invoice' &&
                        'Facturé'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Operators Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Opérateurs
            </h3>

            {session.acceptedOperators &&
            session.acceptedOperators.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">
                  Confirmés ({session.acceptedOperators.length})
                </p>
                <div className="space-y-2">
                  {session.acceptedOperators.map((op: any) => (
                    <div
                      key={op.operatorId}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg dark:bg-green-900/20 dark:border-green-800"
                    >
                      <div>
                        <p className="font-medium text-sm">{op.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {op.email}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Accepté
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {session.pendingOperators && session.pendingOperators.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-blue-600 mb-2">
                  En Attente ({session.pendingOperators.length})
                </p>
                <div className="space-y-2">
                  {session.pendingOperators.map((op: any) => (
                    <div
                      key={op.operatorId}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div>
                        <p className="font-medium text-sm">{op.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {op.email}
                        </p>
                      </div>
                      <Badge variant="secondary">En attente</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(!session.acceptedOperators ||
              session.acceptedOperators.length === 0) &&
            (!session.pendingOperators ||
              session.pendingOperators.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aucun opérateur pour cette session
              </div>
            ) : null}
          </div>

          {/* Marketplace Badge */}
          {session.marketplaceVisible && (
            <div className="rounded-lg bg-purple-600/10 border border-purple-200 dark:border-purple-800 p-3 text-purple-700 dark:text-purple-400 text-sm">
              ✓ Cette session est visible sur la marketplace
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {!staffing.isOperational && onAssign && (
            <Button
              variant="default"
              onClick={() => {
                onAssign(session.id);
                onClose();
              }}
            >
              Affecter opérateurs
            </Button>
          )}

          {onEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onEdit(session.id);
                onClose();
              }}
            >
              Modifier
            </Button>
          )}

          <Button variant="ghost" onClick={onClose} className="ml-auto">
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
