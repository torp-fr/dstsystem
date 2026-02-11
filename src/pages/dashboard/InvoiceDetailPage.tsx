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
import { ArrowLeft, FileText, AlertCircle, Check, Clock } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: clients = [] } = useClients();
  const { data: quotesData = [] } = useQuotes();
  const { data: amendments = [] } = useAmendments();
  const { data: deposits = [] } = useDeposits();

  // Find invoice and related quote
  const quoteWithInvoice = quotesData.find(
    (q: any) => q.invoice && q.invoice.id === id
  );
  const invoice = quoteWithInvoice?.invoice;
  const quote = quoteWithInvoice;

  if (!invoice) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/invoices')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Facture introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const client = clients.find((c) => c.id === invoice.client_id);
  const invoiceAmendments = amendments.filter((a: any) => a.invoice_id === invoice.id);
  const invoiceDeposits = deposits.filter((d: any) => d.invoice_id === invoice.id);

  // Calculate balance
  const totalDeposits = invoiceDeposits.reduce(
    (sum: number, d: any) => (d.status === 'paid' ? sum + d.amount : sum),
    0
  );
  const amendmentTotal = invoiceAmendments.reduce(
    (sum: number, a: any) => (a.status === 'accepted' ? sum + a.amount_change : sum),
    0
  );
  const finalTotal = invoice.total_amount + amendmentTotal;
  const outstandingBalance = finalTotal - totalDeposits;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: Check },
      overdue: {
        label: 'En retard',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      },
      partial: {
        label: 'Partiellement payée',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <Badge className={badge.color}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/invoices')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
        {getStatusBadge(invoice.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Invoice Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-semibold">
                  {client
                    ? `${client.first_name} ${client.last_name}`
                    : 'Client inconnu'}
                </p>
                {client?.company_name && (
                  <p className="text-sm text-muted-foreground">{client.company_name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'émission</p>
                <p className="font-semibold">
                  {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'échéance</p>
                <p className="font-semibold">
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString('fr-FR')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut de paiement</p>
                <p className="font-semibold">
                  {invoice.paid_date
                    ? `Payée le ${new Date(invoice.paid_date).toLocaleDateString('fr-FR')}`
                    : 'Non payée'}
                </p>
              </div>
            </div>

            {invoice.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant HT</span>
              <span className="font-mono font-semibold">
                {invoice.amount.toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA</span>
              <span className="font-mono font-semibold">
                {invoice.tax_amount.toFixed(2)}€
              </span>
            </div>
            {amendmentTotal !== 0 && (
              <div className="flex justify-between border-t pt-3">
                <span className="text-muted-foreground">Avenants</span>
                <span className={`font-mono font-semibold ${
                  amendmentTotal > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {amendmentTotal > 0 ? '+' : ''}{amendmentTotal.toFixed(2)}€
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Montant total</span>
              <span className="font-mono text-lg">{finalTotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">Acomptes payés</span>
              <span className="font-mono font-semibold text-green-600">
                -{totalDeposits.toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between border-t pt-3 bg-muted p-3 rounded-lg">
              <span className="font-semibold">Solde impayé</span>
              <span className={`font-mono font-bold text-lg ${
                outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {outstandingBalance.toFixed(2)}€
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="devis" className="mb-6">
        <TabsList>
          <TabsTrigger value="devis">Devis associé</TabsTrigger>
          <TabsTrigger value="amendments">
            Avenants ({invoiceAmendments.length})
          </TabsTrigger>
          <TabsTrigger value="deposits">
            Acomptes ({invoiceDeposits.length})
          </TabsTrigger>
        </TabsList>

        {/* Quote Tab */}
        <TabsContent value="devis">
          {quote ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {quote.quote_number}
                </CardTitle>
                <CardDescription>
                  Généré le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sous-total</p>
                    <p className="font-mono font-semibold">
                      {quote.subtotal.toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TVA</p>
                    <p className="font-mono font-semibold">
                      {quote.tax_amount.toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-mono font-semibold">
                      {quote.total_amount.toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge>{quote.status}</Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/dashboard/quotes/${quote.id}/edit`)}
                  >
                    Voir le devis
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Aucun devis associé</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Amendments Tab */}
        <TabsContent value="amendments">
          {invoiceAmendments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">Aucun avenant</p>
                <Button
                  onClick={() => navigate('/dashboard/amendments/new')}
                  variant="outline"
                >
                  Créer un avenant
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {invoiceAmendments.map((amendment: any) => (
                <Card key={amendment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{amendment.amendment_number}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {amendment.changes_description}
                        </p>
                        <p className="text-sm">
                          Montant: <span className="font-mono font-semibold">
                            {amendment.amount_change > 0 ? '+' : ''}
                            {amendment.amount_change.toFixed(2)}€
                          </span>
                        </p>
                      </div>
                      <Badge>{amendment.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits">
          {invoiceDeposits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">Aucun acompte</p>
                <Button
                  onClick={() => navigate('/dashboard/deposits/new')}
                  variant="outline"
                >
                  Créer un acompte
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {invoiceDeposits.map((deposit: any) => (
                <Card key={deposit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{deposit.deposit_number}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Montant: <span className="font-mono font-semibold">
                            {deposit.amount.toFixed(2)}€
                          </span>
                          {deposit.percentage_of_total && (
                            <span> ({deposit.percentage_of_total}%)</span>
                          )}
                        </p>
                        <p className="text-sm">
                          Échéance: {new Date(deposit.due_date).toLocaleDateString('fr-FR')}
                          {deposit.paid_date && (
                            <> • Payé le {new Date(deposit.paid_date).toLocaleDateString('fr-FR')}</>
                          )}
                        </p>
                      </div>
                      <Badge>{deposit.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/dashboard/invoices')}>
          Retour à la liste
        </Button>
      </div>
    </div>
  );
}
