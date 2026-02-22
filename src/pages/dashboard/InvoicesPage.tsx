import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { Plus, Eye, AlertCircle, Check, Clock } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  outstanding_balance: number;
  status: string;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  quote_id: string | null;
  session_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: clients = [] } = useClients();
  const { data: quotesData = [] } = useQuotes();

  // Extract invoices from quotes data (they contain invoice information)
  const invoices: Invoice[] = quotesData
    .filter((q: any) => q.invoice && q.invoice.id)
    .map((q: any) => ({
      ...q.invoice,
      client: q.client,
    }));

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(invoice.client_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Client inconnu';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: Check },
      overdue: { label: 'En retard', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      partial: { label: 'Partiellement payée', color: 'bg-blue-100 text-blue-800', icon: Clock },
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

  const isDueToday = (dueDate: string | null) => {
    if (!dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate === today;
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'paid') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  // Calculate stats
  const stats = {
    total: invoices.length,
    pending: invoices.filter((i) => i.status === 'pending').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => isOverdue(i.due_date, i.status)).length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total_amount, 0),
    outstandingBalance: invoices.reduce((sum, i) => sum + (i.outstanding_balance || 0), 0),
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Factures</h1>
        <Button onClick={() => navigate('/dashboard/quotes')} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer facture
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {stats.totalAmount.toFixed(2)}€
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solde impayé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {stats.outstandingBalance.toFixed(2)}€
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="paid">Payée</SelectItem>
            <SelectItem value="partial">Partiellement payée</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucune facture trouvée</p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/quotes')}
                >
                  Créer une facture à partir d'un devis
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className={`${
                isOverdue(invoice.due_date, invoice.status)
                  ? 'border-border bg-card'
                  : ''
              } cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => navigate(`/dashboard/invoices/${invoice.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {invoice.invoice_number}
                      </h3>
                      {getStatusBadge(invoice.status)}
                      {isDueToday(invoice.due_date) && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Échéance aujourd'hui
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Client: {getClientName(invoice.client_id)}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Montant:</span>
                        <p className="font-mono font-semibold">
                          {invoice.total_amount.toFixed(2)}€
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Solde:</span>
                        <p className={`font-mono font-semibold ${
                          invoice.outstanding_balance > 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {invoice.outstanding_balance.toFixed(2)}€
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Émise:</span>
                        <p className="font-mono">
                          {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/invoices/${invoice.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p>
              <strong>📄 Factures:</strong> Générées automatiquement à partir des devis
            </p>
            <p>
              <strong>💰 Solde:</strong> Total - Acomptes payés = Montant restant dû
            </p>
            <p>
              <strong>🔗 Avenants:</strong> Modifiez les montants avec des avenants
            </p>
            <p>
              <strong>✅ Acomptes:</strong> Suivez les paiements partiels
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
