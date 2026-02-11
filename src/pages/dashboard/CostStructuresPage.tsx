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
import {
  useCostStructures,
  useDeleteCostStructure,
  useMonthlyCostTotal,
  useAnnualCostTotal,
  useCostsByCategory,
} from '@/hooks/useCostStructures';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  fixed_cost: 'Coûts fixes',
  amortization: 'Amortissements',
  operating_expense: 'Charges d\'exploitation',
};

const categoryColors: Record<string, string> = {
  fixed_cost: 'bg-blue-100 text-blue-800',
  amortization: 'bg-purple-100 text-purple-800',
  operating_expense: 'bg-green-100 text-green-800',
};

export default function CostStructuresPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: costStructures = [], isLoading, error } = useCostStructures({
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    is_active: true,
  });

  const deleteCostStructure = useDeleteCostStructure();
  const monthlyCosts = useMonthlyCostTotal(costStructures);
  const annualCosts = useAnnualCostTotal(costStructures);
  const costsByCategory = useCostsByCategory(costStructures);

  const filteredCosts = costStructures.filter(
    (cost) =>
      cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCostStructure.mutateAsync(deleteId);
      toast({
        title: 'Succès',
        description: 'Coût supprimé avec succès',
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
        <p className="text-red-500">Erreur lors du chargement de la structure des coûts</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Structure des coûts</h1>
          <p className="text-gray-600">Gestion des coûts fixes, amortissements et charges</p>
        </div>
        <Button onClick={() => navigate('/dashboard/costs/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau coût
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Coûts mensuels</p>
          <p className="text-2xl font-bold">{monthlyCosts.toFixed(2)}€</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Coûts annuels</p>
          <p className="text-2xl font-bold">{annualCosts.toFixed(2)}€</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Coûts fixes</p>
          <p className="text-2xl font-bold text-blue-600">
            {(costsByCategory.fixed_cost || 0).toFixed(2)}€
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Amortissements</p>
          <p className="text-2xl font-bold text-purple-600">
            {(costsByCategory.amortization || 0).toFixed(2)}€
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6 flex flex-col gap-4 md:flex-row md:gap-2">
        <Input
          placeholder="Rechercher par nom ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="fixed_cost">Coûts fixes</SelectItem>
            <SelectItem value="amortization">Amortissements</SelectItem>
            <SelectItem value="operating_expense">Charges d'exploitation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cost List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredCosts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg space-y-4">
          <p className="text-gray-600">Aucun coût défini</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/dashboard/costs/initialize')} className="gap-2">
              <Plus className="h-4 w-4" />
              Initialiser avec coûts standards
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/costs/new')}>
              Ajouter manuellement
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCosts.map((cost) => (
            <div key={cost.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{cost.name}</h3>
                    <Badge className={categoryColors[cost.category]}>
                      {categoryLabels[cost.category]}
                    </Badge>
                  </div>
                  {cost.description && (
                    <p className="text-sm text-gray-600 mb-3">{cost.description}</p>
                  )}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Mensuel:</span>
                      <span className="font-semibold ml-2">{cost.monthly_amount.toFixed(2)}€</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Annuel:</span>
                      <span className="font-semibold ml-2">{cost.annual_amount.toFixed(2)}€</span>
                    </div>
                    {cost.expense_account && (
                      <div>
                        <span className="text-gray-600">Compte:</span>
                        <span className="font-mono ml-2 text-xs">{cost.expense_account}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/costs/${cost.id}/edit`)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(cost.id)}
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
          <AlertDialogTitle>Supprimer le coût</AlertDialogTitle>
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
