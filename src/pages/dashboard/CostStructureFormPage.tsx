import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import {
  useCostStructureById,
  useCreateCostStructure,
  useUpdateCostStructure,
  type CostStructure,
} from '@/hooks/useCostStructures';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CostStructureFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: cost, isLoading: costLoading } = useCostStructureById(id);
  const createCost = useCreateCostStructure();
  const updateCost = useUpdateCostStructure();

  const [formData, setFormData] = useState({
    category: 'fixed_cost' as const,
    name: '',
    description: '',
    monthly_amount: '',
    annual_amount: '',
    expense_account: '',
    is_active: true,
    created_by: null,
  });

  useEffect(() => {
    if (cost) {
      setFormData({
        category: cost.category as any,
        name: cost.name,
        description: cost.description || '',
        monthly_amount: cost.monthly_amount.toString(),
        annual_amount: cost.annual_amount.toString(),
        expense_account: cost.expense_account || '',
        is_active: cost.is_active,
        created_by: cost.created_by,
      });
    }
  }, [cost]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      is_active: !prev.is_active,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le nom du coût',
        variant: 'destructive',
      });
      return;
    }

    try {
      const monthly = parseFloat(formData.monthly_amount) || 0;
      const annual = parseFloat(formData.annual_amount) || 0;

      if (isEditing) {
        await updateCost.mutateAsync({
          id: id!,
          category: formData.category,
          name: formData.name,
          description: formData.description || null,
          monthly_amount: monthly,
          annual_amount: annual,
          expense_account: formData.expense_account || null,
          is_active: formData.is_active,
          created_by: formData.created_by,
        } as any);
        toast({
          title: 'Succès',
          description: 'Coût mis à jour',
        });
        navigate('/dashboard/costs');
      } else {
        await createCost.mutateAsync({
          category: formData.category,
          name: formData.name,
          description: formData.description || null,
          monthly_amount: monthly,
          annual_amount: annual,
          expense_account: formData.expense_account || null,
          is_active: formData.is_active,
          created_by: formData.created_by,
        } as any);
        toast({
          title: 'Succès',
          description: 'Coût créé avec succès',
        });
        navigate('/dashboard/costs');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  if (costLoading && isEditing) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/costs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier coût' : 'Nouveau coût'}
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du coût</CardTitle>
          <CardDescription>Définir un coût de structure, amortissement ou charge</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Catégorie*</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium">Statut*</label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleToggle}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm">
                    {formData.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Nom du coût*</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ex. Loyer bureau"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Détails du coût..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Montant mensuel (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="monthly_amount"
                  value={formData.monthly_amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Montant annuel (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="annual_amount"
                  value={formData.annual_amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Compte de charges (optionnel)</label>
              <Input
                name="expense_account"
                value={formData.expense_account}
                onChange={handleInputChange}
                placeholder="ex. 60100"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={createCost.isPending || updateCost.isPending}>
                {createCost.isPending || updateCost.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : isEditing ? (
                  'Mettre à jour'
                ) : (
                  'Créer coût'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/costs')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
