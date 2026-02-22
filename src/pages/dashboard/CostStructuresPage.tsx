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
  useCreateCostStructure,
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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'fixed_cost',
    monthly_amount: '',
    annual_amount: '',
  });

  const { data: costStructures = [], isLoading, error } = useCostStructures({
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    is_active: true,
  });

  const deleteCostStructure = useDeleteCostStructure();
  const createCostStructure = useCreateCostStructure();
  const monthlyCosts = useMonthlyCostTotal(costStructures);
  const annualCosts = useAnnualCostTotal(costStructures);
  const costsByCategory = useCostsByCategory(costStructures);

  const filteredCosts = costStructures.filter(
    (cost) =>
      cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickAdd = async () => {
    if (!formData.name || !formData.monthly_amount) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le montant mensuel sont requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCostStructure.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any,
        monthly_amount: parseFloat(formData.monthly_amount),
        annual_amount: parseFloat(formData.annual_amount) || parseFloat(formData.monthly_amount) * 12,
        is_active: true,
      });
      toast({
        title: 'Succès',
        description: 'Coût ajouté avec succès',
      });
      setFormData({ name: '', description: '', category: 'fixed_cost', monthly_amount: '', annual_amount: '' });
      setShowQuickAdd(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout du coût',
        variant: 'destructive',
      });
    }
  };

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
          <p className="text-muted-foreground">Gestion des coûts fixes, amortissements et charges</p>
        </div>
        <Button onClick={() => navigate('/dashboard/costs/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau coût
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border-border border-border-border p-4">
          <p className="text-sm text-muted-foreground">Coûts mensuels</p>
          <p className="text-2xl font-bold">{monthlyCosts.toFixed(2)}€</p>
        </div>
        <div className="bg-card rounded-lg border-border border-border-border p-4">
          <p className="text-sm text-muted-foreground">Coûts annuels</p>
          <p className="text-2xl font-bold">{annualCosts.toFixed(2)}€</p>
        </div>
        <div className="bg-card rounded-lg border-border border-border-border p-4">
          <p className="text-sm text-muted-foreground">Coûts fixes</p>
          <p className="text-2xl font-bold text-blue-600">
            {(costsByCategory.fixed_cost || 0).toFixed(2)}€
          </p>
        </div>
        <div className="bg-card rounded-lg border-border border-border-border p-4">
          <p className="text-sm text-muted-foreground">Amortissements</p>
          <p className="text-2xl font-bold text-purple-600">
            {(costsByCategory.amortization || 0).toFixed(2)}€
          </p>
        </div>
      </div>

      {/* Quick Add Form */}
      {showQuickAdd && (
        <div className="bg-card rounded-lg border-border border-border-border p-6 mb-6">
          <h3 className="font-semibold mb-4">Ajouter un coût rapidement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input
                placeholder="Ex: Loyer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_cost">Coûts fixes</SelectItem>
                  <SelectItem value="amortization">Amortissements</SelectItem>
                  <SelectItem value="operating_expense">Charges d'exploitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Montant mensuel (€) *</label>
              <Input
                type="number"
                placeholder="0"
                min="0"
                step="100"
                value={formData.monthly_amount}
                onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Montant annuel (€)</label>
              <Input
                type="number"
                placeholder="Auto (×12)"
                min="0"
                step="100"
                value={formData.annual_amount}
                onChange={(e) => setFormData({ ...formData, annual_amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleQuickAdd} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => setShowQuickAdd(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Description optionnelle : laissez vide pour ajouter après</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border-border border-border-border p-4 mb-6 flex flex-col gap-4 md:flex-row md:gap-2">
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
        {!showQuickAdd && (
          <Button variant="outline" onClick={() => setShowQuickAdd(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajout rapide
          </Button>
        )}
      </div>

      {/* Cost List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCosts.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg space-y-4">
          <p className="text-muted-foreground">Aucun coût défini</p>
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
            <div key={cost.id} className="bg-card p-4 rounded-lg border-border border-border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{cost.name}</h3>
                    <Badge className={categoryColors[cost.category]}>
                      {categoryLabels[cost.category]}
                    </Badge>
                  </div>
                  {cost.description && (
                    <p className="text-sm text-muted-foreground mb-3">{cost.description}</p>
                  )}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mensuel:</span>
                      <span className="font-semibold ml-2">{cost.monthly_amount.toFixed(2)}€</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Annuel:</span>
                      <span className="font-semibold ml-2">{cost.annual_amount.toFixed(2)}€</span>
                    </div>
                    {cost.expense_account && (
                      <div>
                        <span className="text-muted-foreground">Compte:</span>
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
