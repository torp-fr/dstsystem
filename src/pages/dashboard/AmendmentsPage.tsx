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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAmendments } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Eye, Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Rejeté',
};

export default function AmendmentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: amendments = [], isLoading, error } = useAmendments();
  const { data: clients = [] } = useClients();

  const filteredAmendments = amendments.filter((amendment: any) => {
    const matchesSearch =
      amendment.amendment_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      amendment.changes_description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || amendment.status === statusFilter;

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'quote' && amendment.quote_id) ||
      (typeFilter === 'invoice' && amendment.invoice_id);

    return matchesSearch && matchesStatus && matchesType;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Client inconnu';
  };

  const totalAmendments = amendments.length;
  const totalAmount = amendments.reduce(
    (sum: number, a: any) => sum + (a.amount_change || 0),
    0
  );
  const acceptedAmount = amendments
    .filter((a: any) => a.status === 'accepted')
    .reduce((sum: number, a: any) => sum + (a.amount_change || 0), 0);

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Erreur lors du chargement des avenants</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Avenants</h1>
          <p className="text-muted-foreground">Modifications de devis et factures</p>
        </div>
        <Button onClick={() => navigate('/dashboard/amendments/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel avenant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-muted-foreground">Total avenants</p>
          <p className="text-2xl font-bold">{totalAmendments}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-muted-foreground">Montant total des modifications</p>
          <p className="text-2xl font-bold">{totalAmount.toFixed(2)}€</p>
        </div>
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-muted-foreground">Acceptés</p>
          <p className="text-2xl font-bold text-green-600">{acceptedAmount.toFixed(2)}€</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border-border mb-6 flex flex-col gap-4 md:flex-row md:gap-2">
        <Input
          placeholder="Rechercher par numéro ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="quote">Devis</SelectItem>
            <SelectItem value="invoice">Facture</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="sent">Envoyé</SelectItem>
            <SelectItem value="accepted">Accepté</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Amendments List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredAmendments.length === 0 ? (
        <div className="text-center p-8 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">Aucun avenant trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAmendments.map((amendment: any) => (
            <div
              key={amendment.id}
              className="bg-card p-4 rounded-lg border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {amendment.amendment_number}
                    </h3>
                    <Badge className={statusColors[amendment.status]}>
                      {statusLabels[amendment.status]}
                    </Badge>
                    <Badge variant="outline">
                      {amendment.quote_id ? 'Devis' : 'Facture'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Client:</span>
                      <p className="font-medium">
                        {getClientName(amendment.client_id)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Modification:</span>
                      <p className={`font-bold ${amendment.amount_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {amendment.amount_change > 0 ? '+' : ''}
                        {amendment.amount_change.toFixed(2)}€
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nouveau total:</span>
                      <p className="font-bold">
                        {amendment.new_total?.toFixed(2) || 'N/A'}€
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="font-medium truncate">
                        {amendment.changes_description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/amendments/${amendment.id}`)}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/amendments/${amendment.id}/edit`)}
                    title="Éditer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
