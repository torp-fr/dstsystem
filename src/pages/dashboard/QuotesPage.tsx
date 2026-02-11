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
import { useQuotes } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Eye, Download } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  converted_to_invoice: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Rejeté',
  converted_to_invoice: 'Facturisé',
};

export default function QuotesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: quotes = [], isLoading, error } = useQuotes({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const filteredQuotes = quotes.filter(
    (quote: any) =>
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Erreur lors du chargement des devis</p>
      </div>
    );
  }

  const totalAmount = quotes.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0);
  const pendingAmount = quotes
    .filter((q: any) => q.status !== 'converted_to_invoice' && q.status !== 'rejected')
    .reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Devis</h1>
          <p className="text-gray-600">Gestion des devis clients</p>
        </div>
        <Button onClick={() => navigate('/dashboard/quotes/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau devis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total devis</p>
          <p className="text-2xl font-bold">{quotes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Montant total</p>
          <p className="text-2xl font-bold">{totalAmount.toFixed(2)}€</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-orange-600">{pendingAmount.toFixed(2)}€</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6 flex flex-col gap-4 md:flex-row md:gap-2">
        <Input
          placeholder="Rechercher par numéro, client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="sent">Envoyé</SelectItem>
            <SelectItem value="accepted">Accepté</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
            <SelectItem value="converted_to_invoice">Facturisé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotes List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucun devis trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote: any) => (
            <div
              key={quote.id}
              className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{quote.quote_number}</h3>
                    <Badge className={statusColors[quote.status]}>
                      {statusLabels[quote.status]}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <p className="font-medium">
                        {quote.client?.first_name} {quote.client?.last_name}
                        {quote.client?.company_name && ` (${quote.client.company_name})`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant:</span>
                      <p className="font-bold text-lg">{quote.total_amount.toFixed(2)}€</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Validité:</span>
                      <p className="font-medium">
                        {new Date(quote.valid_from).toLocaleDateString('fr-FR')} -{' '}
                        {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {quote.session && (
                      <div>
                        <span className="text-gray-600">Session:</span>
                        <p className="font-medium">
                          {new Date(quote.session.session_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/quotes/${quote.id}`)}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/quotes/${quote.id}/edit`)}
                    title="Éditer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Télécharger PDF"
                  >
                    <Download className="h-4 w-4" />
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
