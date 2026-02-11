import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClientSubscriptions } from '@/hooks/useClientSubscriptions';
import { useShootingSessions } from '@/hooks/useShootingSessions';
import { useQuotes } from '@/hooks/useQuotes';
import { TrendingUp, TrendingDown, CheckCircle2, Clock } from 'lucide-react';

interface ClientPaymentTrackingProps {
  clientId: string;
}

export default function ClientPaymentTracking({ clientId }: ClientPaymentTrackingProps) {
  const { data: subscriptions = [] } = useClientSubscriptions(clientId);
  const { data: sessions = [] } = useShootingSessions({ client_id: clientId });
  const { data: quotes = [] } = useQuotes({ client_id: clientId });

  // Filter sessions for this client
  const clientSessions = sessions || [];
  const completedSessions = clientSessions.filter((s: any) => s.status === 'completed').length;
  const scheduledSessions = clientSessions.filter((s: any) => s.status === 'scheduled').length;

  // Calculate financials
  const totalQuotesValue = quotes.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0);
  const totalPaidValue = quotes
    .filter((q: any) => q.invoice && q.invoice.status === 'paid')
    .reduce((sum: number, q: any) => sum + (q.invoice?.total_amount || 0), 0);
  const outstandingBalance = totalQuotesValue - totalPaidValue;

  return (
    <div className="space-y-4">
      {/* Session Tracking */}
      {subscriptions.some((s: any) => s.offer?.offer_type === 'subscription') && (
        <Card>
          <CardHeader>
            <CardTitle>Suivi des sessions</CardTitle>
            <CardDescription>Consommation par abonnement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions
                .filter((s: any) => s.offer?.offer_type === 'subscription')
                .map((sub: any) => {
                  const offerSessions = sub.offer?.included_sessions || 0;
                  const consumedSessions = completedSessions;
                  const remainingSessions = Math.max(0, offerSessions - consumedSessions);
                  const consumptionPercent = (consumedSessions / offerSessions) * 100;

                  return (
                    <div key={sub.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold">{sub.offer?.name}</p>
                        <Badge variant="outline">{sub.status === 'active' ? 'Actif' : 'Inactif'}</Badge>
                      </div>

                      <div className="space-y-3">
                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Sessions consommées</span>
                            <span className="font-semibold">
                              {consumedSessions} / {offerSessions}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(consumptionPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-emerald-600/10 p-3 rounded">
                            <p className="text-muted-foreground text-xs">Utilisées</p>
                            <p className="font-semibold text-emerald-600">{consumedSessions}</p>
                          </div>
                          <div className="bg-amber-600/10 p-3 rounded">
                            <p className="text-muted-foreground text-xs">Restantes</p>
                            <p className="font-semibold text-amber-600">{remainingSessions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi des paiements</CardTitle>
          <CardDescription>Factures et encaissements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">CA Total</p>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{totalQuotesValue.toFixed(0)}€</p>
              </div>

              <div className="bg-emerald-600/10 p-4 rounded-lg border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Encaissé</p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-600">{totalPaidValue.toFixed(0)}€</p>
              </div>

              <div className={`p-4 rounded-lg border ${outstandingBalance > 0 ? 'bg-amber-600/10 border-amber-500/30' : 'bg-muted/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">À recevoir</p>
                  <Clock className="h-4 w-4" />
                </div>
                <p className={`text-2xl font-bold ${outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {outstandingBalance.toFixed(0)}€
                </p>
              </div>
            </div>

            {/* Payment Rate */}
            {totalQuotesValue > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Taux de paiement</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-emerald-600 h-3 rounded-full transition-all"
                        style={{ width: `${(totalPaidValue / totalQuotesValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="font-semibold text-sm w-12 text-right">
                    {((totalPaidValue / totalQuotesValue) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            )}

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{completedSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions complétées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{scheduledSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions prévues</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
