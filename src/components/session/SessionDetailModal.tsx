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
import { Users, Calendar, MapPin, DollarSign, X } from 'lucide-react';
import { useQuotes, type Quote } from '@/hooks/useQuotes';

/**
 * SessionDetailModal — Modal-based Session Detail View
 *
 * Replaces SessionDetailPageV2 route. Receives full session object
 * from parent component and displays in modal.
 *
 * PURE UI LAYER - no business logic modifications.
 */

interface SessionStaffing {
  minOperators: number;
  acceptedOperators: number;
  pendingApplications: number;
  isOperational: boolean;
}

interface Operator {
  operatorId: string;
  name: string;
  email: string;
}

interface SessionDetailModalProps {
  session: {
    id: string;
    date: string;
    clientId: string;
    regionId: string;
    status: string;
    marketplaceVisible: boolean;
    setupIds: string[];
    staffing: SessionStaffing;
    acceptedOperators?: Operator[];
    pendingOperators?: Operator[];
    rejectedOperators?: Operator[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (sessionId: string) => void;
  onAssign?: (sessionId: string) => void;
}

export default function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onEdit,
  onAssign,
}: SessionDetailModalProps) {
  const [businessData, setBusinessData] = useState<Quote | null>(null);

  // Fetch quotes to find one linked to this session
  const { data: quotes = [] } = useQuotes();

  useEffect(() => {
    if (session?.id) {
      const linkedQuote = quotes.find((q: Quote) => q.session_id === session.id);
      setBusinessData(linkedQuote || null);
    }
  }, [session?.id, quotes]);

  if (!session) {
    return null;
  }

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
              {session.setupIds.length > 0 && (
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
                      session.staffing.isOperational ? 'default' : 'secondary'
                    }
                  >
                    {session.staffing.isOperational
                      ? 'Opérationnelle'
                      : 'Incomplète'}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Affectations
                  </p>
                  <p className="text-sm font-semibold">
                    {session.staffing.acceptedOperators}/
                    {session.staffing.minOperators} opérateurs
                  </p>
                  {session.staffing.pendingApplications > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {session.staffing.pendingApplications} candidatures en
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
                  {session.acceptedOperators.map((op) => (
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
                  {session.pendingOperators.map((op) => (
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
          {!session.staffing.isOperational && onAssign && (
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
