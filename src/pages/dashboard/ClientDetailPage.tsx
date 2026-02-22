import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useClients } from '@/hooks/useClients';
import { useQuotes, useDeleteQuote, useAmendments, useDeposits } from '@/hooks/useQuotes';
import { ArrowLeft, FileText, Receipt, CreditCard, DollarSign, Users, Settings, Zap, Trash2, Edit2, Calendar, MapPin } from 'lucide-react';
import { getClientPlanningSafe } from '@/services/planningBridge.service';
import ClientFinancialSummary from '@/components/ClientFinancialSummary';
import ClientSubscriptionManager from '@/components/ClientSubscriptionManager';
import ClientAdminInfo from '@/components/client/ClientAdminInfo';
import ClientCommercialPlan from '@/components/client/ClientCommercialPlan';
import ClientPaymentTracking from '@/components/client/ClientPaymentTracking';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: clientsData = [] } = useClients();
  const { data: quotesData = [] } = useQuotes({ client_id: id });
  const { data: amendments = [] } = useAmendments({ client_id: id });
  const { data: deposits = [] } = useDeposits({ client_id: id });
  const deleteQuote = useDeleteQuote();

  // Client sessions/missions
  const [clientSessions, setClientSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Fetch client sessions
  useEffect(() => {
    if (!id) return;

    setSessionsLoading(true);
    try {
      const result = getClientPlanningSafe(id);
      if (result?.success) {
        // Sort by date DESC (most recent first)
        const sorted = [...(result.sessions || [])].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setClientSessions(sorted);
      } else {
        setClientSessions([]);
      }
    } catch (error) {
      console.error('[ClientDetail] Error loading sessions:', error);
      setClientSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [id]);

  const client = clientsData.find((c) => c.id === id);
  const clientQuotes = quotesData || [];
  const clientInvoices = clientQuotes.filter((q: any) => q.invoice && q.invoice.id);
  const clientAmendments = amendments || [];
  const clientDeposits = deposits || [];

  if (!client) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/clients')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Client non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate financial summary
  const totalQuotesValue = clientQuotes.reduce((sum, q: any) => sum + (q.total_amount || 0), 0);
  const totalInvoicesValue = clientInvoices.reduce((sum: number, q: any) => sum + (q.invoice?.total_amount || 0), 0);
  const totalDepositsValue = clientDeposits.reduce((sum: number, d: any) => (d.status === 'paid' ? sum + (d.amount || 0) : sum), 0);
  const totalAmendmentsValue = clientAmendments.reduce((sum: number, a: any) => sum + (a.amount_change || 0), 0);

  const statusColors: Record<string, string> = {
    prospect: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
  };

  const structureTypes: Record<string, string> = {
    police: '🚔 Police Nationale',
    gendarme: '🪖 Gendarmerie',
    mairie: '🏛️ Mairie',
    pompiers: '🚒 Pompiers',
    militaire: '⚔️ Militaire',
    particulier: '👤 Particulier',
    entreprise: '🏢 Entreprise',
    association: '👥 Association',
    autre: 'Autre',
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/clients')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-muted-foreground">
            {client.company_name && `${client.company_name} • `}
            {structureTypes[client.structure_type as keyof typeof structureTypes] || 'Type inconnu'}
          </p>
        </div>
        <Button
          onClick={() => navigate(`/dashboard/clients/${id}/edit`)}
          variant="outline"
        >
          Modifier
        </Button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className={statusColors[client.status || 'prospect']}>
                {client.status === 'prospect' ? 'Prospect' : client.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Apprenants
              </p>
              <p className="text-2xl font-bold">{client.learner_count || 0}</p>
              {(client.learner_count || 0) > 20 && (
                <p className="text-xs text-amber-600">⚠️ Plus de 20: 2+ jours</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-mono text-sm">{client.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-mono text-sm">{client.phone || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé Financier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Devis</p>
              <p className="text-2xl font-bold text-blue-600">{clientQuotes.length}</p>
              <p className="text-xs text-muted-foreground">{totalQuotesValue.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Factures</p>
              <p className="text-2xl font-bold text-green-600">{clientInvoices.length}</p>
              <p className="text-xs text-muted-foreground">{totalInvoicesValue.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acomptes</p>
              <p className="text-2xl font-bold text-purple-600">{clientDeposits.length}</p>
              <p className="text-xs text-muted-foreground">{totalDepositsValue.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avenants</p>
              <p className="text-2xl font-bold text-orange-600">{clientAmendments.length}</p>
              <p className="text-xs text-muted-foreground">{totalAmendmentsValue.toFixed(2)}€</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="missions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Settings className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="commercial" className="gap-2">
            <Zap className="h-4 w-4" />
            Formule
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Users className="h-4 w-4" />
            Analyses
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Toutes les missions du client</h2>
            <span className="text-sm text-muted-foreground">{clientSessions.length} session(s)</span>
          </div>

          {sessionsLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement des missions...</p>
            </div>
          ) : clientSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">Aucune mission pour ce client</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clientSessions.map((session: any) => {
                // Find quote linked to this session
                const linkedQuote = clientQuotes.find((q: any) => q.session_id === session.sessionId);

                return (
                  <Card
                    key={session.sessionId}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/dashboard/sessions/${session.sessionId}`)}
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Date & Status */}
                        <div className="md:col-span-3">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm">
                                {new Date(session.date).toLocaleDateString('fr-FR', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <Badge className="mt-1" variant={
                                session.status === 'pending_confirmation' ? 'secondary' :
                                session.status === 'confirmed' ? 'default' :
                                session.status === 'completed' ? 'outline' : 'secondary'
                              }>
                                {session.status === 'pending_confirmation' && 'En attente'}
                                {session.status === 'confirmed' && 'Confirmée'}
                                {session.status === 'completed' && 'Complétée'}
                                {!['pending_confirmation', 'confirmed', 'completed'].includes(session.status) && session.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Modules */}
                        <div className="md:col-span-2">
                          {session.setupIds && session.setupIds.length > 0 ? (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Modules</p>
                                <p className="text-sm font-medium truncate">
                                  {session.setupIds.join(', ')}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">-</div>
                          )}
                        </div>

                        {/* Operators */}
                        <div className="md:col-span-2">
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">Opérateurs</p>
                              <p className="text-sm font-medium">
                                {session.operatorCount}/{session.minRequired}
                                <span className={`ml-1 text-xs ${session.isOperational ? 'text-green-600' : 'text-orange-600'}`}>
                                  {session.isOperational ? '✓' : '⚠'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Business Value */}
                        <div className="md:col-span-2">
                          {linkedQuote ? (
                            <div className="flex items-start gap-2">
                              <DollarSign className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Valeur</p>
                                <p className="text-sm font-bold text-green-600">
                                  {linkedQuote.total_amount.toFixed(2)}€
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">-</div>
                          )}
                        </div>

                        {/* Session ID */}
                        <div className="md:col-span-1">
                          <p className="text-xs text-muted-foreground truncate">{session.sessionId}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <ClientAdminInfo client={client} />
          <ClientSubscriptionManager clientId={id!} />
        </TabsContent>

        {/* Commercial Plan Tab */}
        <TabsContent value="commercial">
          <ClientCommercialPlan clientId={id!} />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <ClientPaymentTracking clientId={id!} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analyses Financières</CardTitle>
              <CardDescription>Récapitulatif des activités et performances du client</CardDescription>
            </CardHeader>
            <CardContent>
              {ClientFinancialSummary ? (
                <ClientFinancialSummary clientId={id!} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Analyses financières en cours de chargement...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Tabs defaultValue="quotes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quotes" className="gap-2">
                <FileText className="h-4 w-4" />
                Devis
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Factures
              </TabsTrigger>
              <TabsTrigger value="amendments" className="gap-2">
                <Receipt className="h-4 w-4" />
                Avenants
              </TabsTrigger>
              <TabsTrigger value="deposits" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Acomptes
              </TabsTrigger>
            </TabsList>

        {/* Quotes Tab */}
        <TabsContent value="quotes">
          {clientQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground mb-4">Aucun devis pour ce client</p>
                <Button onClick={() => navigate('/dashboard/quotes/new', { state: { client_id: id } })}>
                  Créer un devis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clientQuotes.map((quote: any) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard/quotes/${quote.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold hover:text-primary">{quote.quote_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-mono font-semibold">{quote.total_amount.toFixed(2)}€</p>
                        <Badge>{quote.status}</Badge>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dashboard/quotes/${quote.id}/edit`)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Modifier
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Supprimer ce devis?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le devis {quote.quote_number} sera supprimé.
                            </AlertDialogDescription>
                            <div className="flex justify-end gap-3">
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteQuote.mutate(quote.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={() => navigate('/dashboard/quotes/new', { state: { client_id: id } })} variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Créer un nouveau devis
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          {clientInvoices.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground mb-4">Aucune facture pour ce client</p>
                <Button onClick={() => navigate('/dashboard/quotes')}>
                  Créer une facture
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clientInvoices.map((quote: any) => (
                <Card key={quote.invoice?.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{quote.invoice?.invoice_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          {quote.invoice?.issue_date &&
                            new Date(quote.invoice.issue_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">{quote.invoice?.total_amount.toFixed(2)}€</p>
                        <Badge>{quote.invoice?.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Amendments Tab */}
        <TabsContent value="amendments">
          {clientAmendments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground mb-4">Aucun avenant pour ce client</p>
                <Button onClick={() => navigate('/dashboard/amendments/new')}>
                  Créer un avenant
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clientAmendments.map((amendment: any) => (
                <Card key={amendment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{amendment.amendment_number}</h4>
                        <p className="text-sm text-muted-foreground">{amendment.changes_description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-semibold ${amendment.amount_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {amendment.amount_change > 0 ? '+' : ''}{amendment.amount_change.toFixed(2)}€
                        </p>
                        <Badge>{amendment.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits">
          {clientDeposits.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground mb-4">Aucun acompte pour ce client</p>
                <Button onClick={() => navigate('/dashboard/deposits/new')}>
                  Créer un acompte
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clientDeposits.map((deposit: any) => (
                <Card key={deposit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{deposit.deposit_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          Échéance: {new Date(deposit.due_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">{deposit.amount.toFixed(2)}€</p>
                        <Badge>{deposit.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
