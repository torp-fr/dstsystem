import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateCostStructure } from '@/hooks/useCostStructures';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Check } from 'lucide-react';

// Coûts standards pré-définis pour DST-System
const STANDARD_COSTS = [
  {
    category: 'fixed_cost',
    name: 'Loyer/Location Salle',
    description: 'Loyer mensuel de la salle de tir',
    monthly_amount: 2500,
    annual_amount: 30000,
  },
  {
    category: 'fixed_cost',
    name: 'Électricité',
    description: 'Facture d\'électricité mensuelle',
    monthly_amount: 500,
    annual_amount: 6000,
  },
  {
    category: 'fixed_cost',
    name: 'Internet/Téléphone',
    description: 'Abonnement internet et téléphone fixe',
    monthly_amount: 150,
    annual_amount: 1800,
  },
  {
    category: 'fixed_cost',
    name: 'Assurance',
    description: 'Assurance responsabilité civile',
    monthly_amount: 300,
    annual_amount: 3600,
  },
  {
    category: 'operating_expense',
    name: 'Déplacement',
    description: 'Frais de déplacement et essence',
    monthly_amount: 800,
    annual_amount: 9600,
  },
  {
    category: 'operating_expense',
    name: 'Maintenance',
    description: 'Maintenance des équipements et armes',
    monthly_amount: 600,
    annual_amount: 7200,
  },
  {
    category: 'operating_expense',
    name: 'Fournitures',
    description: 'Cibles, munitions, équipements consommables',
    monthly_amount: 400,
    annual_amount: 4800,
  },
  {
    category: 'operating_expense',
    name: 'Comptable',
    description: 'Frais comptabilité et gestion administrative',
    monthly_amount: 250,
    annual_amount: 3000,
  },
  {
    category: 'amortization',
    name: 'Amortissement Equipements',
    description: 'Amortissement des armes et équipements',
    monthly_amount: 500,
    annual_amount: 6000,
  },
  {
    category: 'amortization',
    name: 'Amortissement Mobilier',
    description: 'Amortissement du mobilier et agencement',
    monthly_amount: 300,
    annual_amount: 3600,
  },
];

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

export default function CostInitializationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCosts, setSelectedCosts] = useState<Set<number>>(
    new Set(STANDARD_COSTS.map((_, i) => i))
  );
  const [importing, setImporting] = useState(false);

  const createCost = useCreateCostStructure();

  const toggleCost = (index: number) => {
    const newSelected = new Set(selectedCosts);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCosts(newSelected);
  };

  const handleImportAll = async () => {
    setImporting(true);
    try {
      const costsToImport = STANDARD_COSTS.filter((_, i) => selectedCosts.has(i));

      for (const cost of costsToImport) {
        await createCost.mutateAsync({
          category: cost.category,
          name: cost.name,
          description: cost.description,
          monthly_amount: cost.monthly_amount,
          annual_amount: cost.annual_amount,
          expense_account: null,
          is_active: true,
          created_by: null,
        } as any);
      }

      toast({
        title: 'Succès',
        description: `${costsToImport.length} coûts importés avec succès!`,
      });

      setTimeout(() => {
        navigate('/dashboard/costs');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'import des coûts',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const totalMonthly = STANDARD_COSTS.reduce((sum, cost, i) => {
    if (selectedCosts.has(i)) return sum + cost.monthly_amount;
    return sum;
  }, 0);

  const totalAnnual = STANDARD_COSTS.reduce((sum, cost, i) => {
    if (selectedCosts.has(i)) return sum + cost.annual_amount;
    return sum;
  }, 0);

  const byCategory = {
    fixed_cost: STANDARD_COSTS.filter(
      (c, i) => c.category === 'fixed_cost' && selectedCosts.has(i)
    ).reduce((sum, c) => sum + c.monthly_amount, 0),
    amortization: STANDARD_COSTS.filter(
      (c, i) => c.category === 'amortization' && selectedCosts.has(i)
    ).reduce((sum, c) => sum + c.monthly_amount, 0),
    operating_expense: STANDARD_COSTS.filter(
      (c, i) => c.category === 'operating_expense' && selectedCosts.has(i)
    ).reduce((sum, c) => sum + c.monthly_amount, 0),
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Initialisation Structure des Coûts</h1>
        <p className="text-gray-600">Importer les coûts standards pour DST-System</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coûts List */}
        <div className="md:col-span-2 space-y-3">
          {STANDARD_COSTS.map((cost, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                selectedCosts.has(index) ? 'border-2 border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => toggleCost(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCosts.has(index)}
                    onChange={() => toggleCost(index)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{cost.name}</h3>
                      <Badge className={categoryColors[cost.category]}>
                        {categoryLabels[cost.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cost.description}</p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Mensuel:</span>
                        <span className="ml-1 font-mono font-semibold">
                          {cost.monthly_amount}€
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Annuel:</span>
                        <span className="ml-1 font-mono font-semibold">
                          {cost.annual_amount}€
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedCosts.has(index) && (
                    <Check className="h-5 w-5 text-blue-600 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
              <CardDescription>
                {selectedCosts.size} / {STANDARD_COSTS.length} coûts sélectionnés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Totals */}
              <div className="bg-blue-50 p-3 rounded-lg border-border border-blue-200">
                <p className="text-sm text-gray-600">Coûts mensuels totaux</p>
                <p className="text-2xl font-bold text-blue-600">{totalMonthly}€</p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border-border border-green-200">
                <p className="text-sm text-gray-600">Coûts annuels totaux</p>
                <p className="text-2xl font-bold text-green-600">{totalAnnual}€</p>
              </div>

              {/* By Category */}
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Par catégorie (mensuel):</p>
                <div className="space-y-1">
                  {byCategory.fixed_cost > 0 && (
                    <div className="flex justify-between">
                      <span>Coûts fixes:</span>
                      <span className="font-mono">{byCategory.fixed_cost}€</span>
                    </div>
                  )}
                  {byCategory.amortization > 0 && (
                    <div className="flex justify-between">
                      <span>Amortissements:</span>
                      <span className="font-mono">{byCategory.amortization}€</span>
                    </div>
                  )}
                  {byCategory.operating_expense > 0 && (
                    <div className="flex justify-between">
                      <span>Charges d'expl.:</span>
                      <span className="font-mono">{byCategory.operating_expense}€</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t">
                <Button
                  className="w-full gap-2"
                  onClick={handleImportAll}
                  disabled={selectedCosts.size === 0 || importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Import...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Importer {selectedCosts.size}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/dashboard/costs')}
                >
                  Ignorer
                </Button>

                {/* Select all / None */}
                <div className="space-y-1 pt-2 border-t text-xs">
                  <button
                    onClick={() => setSelectedCosts(new Set(STANDARD_COSTS.map((_, i) => i)))}
                    className="text-blue-600 hover:underline block w-full text-left"
                  >
                    ✓ Sélectionner tout
                  </button>
                  <button
                    onClick={() => setSelectedCosts(new Set())}
                    className="text-gray-600 hover:underline block w-full text-left"
                  >
                    ✗ Désélectionner tout
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
