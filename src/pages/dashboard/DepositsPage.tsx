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
import { useDeposits, useUpdateDeposit } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Check, Clock, AlertCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payé',
  overdue: 'En retard',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  paid: Check,
  overdue: AlertCircle,
};

export default function DepositsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [markPaidId, setMarkPaidId] = useState<string | null>(null);

  const { data: deposits = [], isLoading, error } = useDeposits();
  const { data: clients = [] } = useClients();
  const updateDeposit = useUpdateDeposit();

  const filteredDeposits = deposits.filter((deposit: any) => {
    const matchesSearch =
      deposit.deposit_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Client inconnu';
  };

  const handleMarkPaid = async () => {
    if (!markPaidId) return;

    try {
      await updateDeposit.mutateAsync({
        id: markPaidId,
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
      } as any);
      toast({
        title: 'Succès',
        description: 'Acompte marqué comme payé',
      });
      setMarkPaidId(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
    }
  };

  const checkOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && 'pending';
  };

  const totalDeposits = deposits.length;
  const totalAmount = deposits.reduce(
    (sum: number, d: any) => sum + (d.amount || 0),
    0
  );
  const paidAmount = deposits
    .filter((d: any) => d.status === 'paid')
    .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
  const pendingAmount = deposits
    .filter((d: any) => d.status !== 'paid')
    .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Erreur lors du chargement des acomptes</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Acomptes</h1>
          <p className="text-gray-600">Gestion des paiements partiels</p>
        </div>
        <Button onClick={() => navigate('/dashboard/deposits/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel acompte
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-gray-600">Total acomptes</p>
          <p className="text-2xl font-bold">{totalDeposits}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-gray-600">Montant total</p>
          <p className="text-2xl font-bold">{totalAmount.toFixed(2)}€</p>
        </div>
        <div className="bg-card p-4 rounded-lg border-border border-border">
          <p className="text-sm text-gray-600">Payés</p>
          <p className="text-2xl font-bold text-green-600">{paidAmount.toFixed(2)}€</p>
        </div>
        <div className="bg-card p-4 rounded-lg border-border border-yellow-200">
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toFixed(2)}€</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border-border mb-6 flex flex-col gap-4 md:flex-row md:gap-2">
        <Input
          placeholder="Rechercher par numéro..."
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
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deposits List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDeposits.length === 0 ? (
        <div className="text-center p-8 bg-card border border-border rounded-lg">
          <p className="text-gray-600">Aucun acompte trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeposits.map((deposit: any) => {
            const StatusIcon = statusIcons[deposit.status];
            const isOverdue =
              deposit.status !== 'paid' &&
              new Date(deposit.due_date) < new Date();

            return (
              <div
                key={deposit.id}
                className={`p-4 rounded-lg border-border hover:shadow-md transition-shadow ${
                  isOverdue ? 'bg-card border-border' : 'bg-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">
                        {deposit.deposit_number}
                      </h3>
                      <Badge
                        className={
                          isOverdue
                            ? 'bg-red-100 text-red-800'
                            : statusColors[deposit.status]
                        }
                      >
                        {isOverdue ? 'En retard' : statusLabels[deposit.status]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Client:</span>
                        <p className="font-medium">
                          {getClientName(deposit.client_id)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant:</span>
                        <p className="font-bold">{deposit.amount.toFixed(2)}€</p>
                      </div>
                      {deposit.percentage_of_total && (
                        <div>
                          <span className="text-gray-600">Pourcentage:</span>
                          <p className="font-medium">{deposit.percentage_of_total}%</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Dû:</span>
                        <p className="font-medium">
                          {new Date(deposit.due_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {deposit.paid_date && (
                        <div>
                          <span className="text-gray-600">Payé:</span>
                          <p className="font-medium">
                            {new Date(deposit.paid_date).toLocaleDateString(
                              'fr-FR'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {deposit.status !== 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMarkPaidId(deposit.id)}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Marquer payé
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/deposits/${deposit.id}/edit`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mark Paid Dialog */}
      <AlertDialog open={!!markPaidId} onOpenChange={(open) => !open && setMarkPaidId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Marquer comme payé</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr que cet acompte a été payé?
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkPaid} className="bg-green-600">
              Confirmer le paiement
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
