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
import { useOperators, useDeleteOperator } from '@/hooks/useOperators';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';

export default function OperatorsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: operators = [], isLoading, error } = useOperators({
    status: statusFilter === 'all' ? undefined : statusFilter,
    employment_type: employmentFilter === 'all' ? undefined : employmentFilter,
  });

  const deleteOperator = useDeleteOperator();

  const filteredOperators = operators.filter(
    (op) =>
      `${op.first_name} ${op.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteOperator.mutateAsync(deleteId);
      toast({
        title: 'Succès',
        description: 'Opérateur supprimé avec succès',
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Erreur lors du chargement des opérateurs</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Opérateurs</h1>
          <p className="text-muted-foreground">Gestion des animateurs de sessions de tir</p>
        </div>
        <Button onClick={() => navigate('/dashboard/operators/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel opérateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-muted-foreground">Total opérateurs</p>
          <p className="text-2xl font-bold">{operators.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-muted-foreground">Salariés</p>
          <p className="text-2xl font-bold text-blue-600">
            {operators.filter((o) => o.employment_type === 'salary').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border-border">
          <p className="text-sm text-muted-foreground">Freelances</p>
          <p className="text-2xl font-bold text-green-600">
            {operators.filter((o) => o.employment_type === 'freelance').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border-border mb-6 flex flex-col gap-4 md:flex-row md:gap-2">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Type d'emploi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="salary">Salarié</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operators List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : operators.length === 0 ? (
        <div className="text-center p-8 bg-card rounded-lg space-y-4">
          <p className="text-muted-foreground">Aucun opérateur défini</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/dashboard/operators/initialize')} className="gap-2">
              <Plus className="h-4 w-4" />
              Initialiser avec opérateurs standards
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/operators/new')}>
              Ajouter manuellement
            </Button>
          </div>
        </div>
      ) : filteredOperators.length === 0 ? (
        <div className="text-center p-8 bg-card rounded-lg">
          <p className="text-muted-foreground">Aucun opérateur trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOperators.map((operator) => (
            <div key={operator.id} className="bg-card p-4 rounded-lg border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                {/* Avatar */}
                {(operator as any).avatar_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={(operator as any).avatar_url}
                      alt={`${operator.first_name} ${operator.last_name}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-border"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {operator.first_name} {operator.last_name}
                    </h3>
                    <Badge variant={operator.status === 'active' ? 'default' : 'secondary'}>
                      {operator.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant={operator.employment_type === 'salary' ? 'outline' : 'secondary'}>
                      {operator.employment_type === 'salary' ? 'Salarié' : 'Freelance'}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {operator.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${operator.email}`} className="hover:underline">
                          {operator.email}
                        </a>
                      </div>
                    )}
                    {operator.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${operator.phone}`} className="hover:underline">
                          {operator.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  {operator.notes && (
                    <p className="text-sm text-gray-500 mt-2">{operator.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/operators/${operator.id}/edit`)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(operator.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Supprimer l'opérateur</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr ? Cette action est irréversible.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
