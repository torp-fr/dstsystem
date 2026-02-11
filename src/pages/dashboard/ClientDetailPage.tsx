import { useParams, useNavigate } from 'react-router-dom';
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
import { useClients } from '@/hooks/useClients';
import { useQuotes, useAmendments, useDeposits } from '@/hooks/useQuotes';
import { ArrowLeft, FileText, Receipt, CreditCard, DollarSign, Users } from 'lucide-react';
import ClientFinancialSummary from '@/components/ClientFinancialSummary';
import ClientSubscriptionManager from '@/components/ClientSubscriptionManager';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: clientsData = [] } = useClients();
  const { data: quotesData = [] } = useQuotes({ client_id: id });
  const { data: amendments = [] } = useAmendments({ client_id: id });
  const { data: deposits = [] } = useDeposits({ client_id: id });

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

      {/* Client Financial Analysis */}
      <ClientFinancialSummary clientId={id!} />

      {/* Client Subscription Manager */}
      <ClientSubscriptionManager clientId={id!} />

      {/* Documents Tabs */}
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
                <Button onClick={() => navigate('/dashboard/quotes/new')}>
                  Créer un devis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clientQuotes.map((quote: any) => (
                <Card key={quote.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{quote.quote_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">{quote.total_amount.toFixed(2)}€</p>
                        <Badge>{quote.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
    </div>
  );
}
