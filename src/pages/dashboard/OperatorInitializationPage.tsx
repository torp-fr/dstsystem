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
import { useCreateOperator, useCreateOperatorRate } from '@/hooks/useOperators';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Check } from 'lucide-react';

// Opérateurs standards pré-définis
const STANDARD_OPERATORS = [
  {
    first_name: 'Thomas',
    last_name: 'Martin',
    email: 'thomas.martin@dst-system.fr',
    phone: '+33 6 12 34 56 78',
    employment_type: 'salary' as const,
    rates: [
      { rate_type: 'monthly_salary', rate_amount: 2500 },
    ],
  },
  {
    first_name: 'Sophie',
    last_name: 'Dupont',
    email: 'sophie.dupont@dst-system.fr',
    phone: '+33 6 23 45 67 89',
    employment_type: 'salary' as const,
    rates: [
      { rate_type: 'monthly_salary', rate_amount: 2200 },
    ],
  },
  {
    first_name: 'Jacques',
    last_name: 'Laurent',
    email: 'jacques.laurent@freelance.fr',
    phone: '+33 6 34 56 78 90',
    employment_type: 'freelance' as const,
    rates: [
      { rate_type: 'per_session', rate_amount: 150 },
      { rate_type: 'daily', rate_amount: 400 },
    ],
  },
  {
    first_name: 'Marie',
    last_name: 'Bernard',
    email: 'marie.bernard@freelance.fr',
    phone: '+33 6 45 67 89 01',
    employment_type: 'freelance' as const,
    rates: [
      { rate_type: 'per_session', rate_amount: 120 },
      { rate_type: 'daily', rate_amount: 350 },
    ],
  },
  {
    first_name: 'Pierre',
    last_name: 'Moreau',
    email: 'pierre.moreau@freelance.fr',
    phone: '+33 6 56 78 90 12',
    employment_type: 'freelance' as const,
    rates: [
      { rate_type: 'hourly', rate_amount: 25 },
    ],
  },
];

export default function OperatorInitializationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedOperators, setSelectedOperators] = useState<Set<number>>(
    new Set(STANDARD_OPERATORS.map((_, i) => i))
  );
  const [importing, setImporting] = useState(false);

  const createOperator = useCreateOperator();
  const createRate = useCreateOperatorRate();

  const toggleOperator = (index: number) => {
    const newSelected = new Set(selectedOperators);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedOperators(newSelected);
  };

  const handleImportAll = async () => {
    setImporting(true);
    try {
      const operatorsToImport = STANDARD_OPERATORS.filter((_, i) =>
        selectedOperators.has(i)
      );

      for (const operator of operatorsToImport) {
        const result = await createOperator.mutateAsync({
          first_name: operator.first_name,
          last_name: operator.last_name,
          email: operator.email,
          phone: operator.phone,
          employment_type: operator.employment_type,
          status: 'active',
          notes: null,
          created_by: null,
        } as any);

        // Add rates
        for (const rate of operator.rates) {
          await createRate.mutateAsync({
            operator_id: result.id,
            rate_type: rate.rate_type,
            rate_amount: rate.rate_amount,
            currency: 'EUR',
            effective_from: new Date().toISOString().split('T')[0],
            effective_to: null,
          });
        }
      }

      toast({
        title: 'Succès',
        description: `${operatorsToImport.length} opérateurs importés avec succès!`,
      });

      setTimeout(() => {
        navigate('/dashboard/operators');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'import des opérateurs',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const salaryCount = STANDARD_OPERATORS.filter(
    (op, i) => op.employment_type === 'salary' && selectedOperators.has(i)
  ).length;
  const freelanceCount = STANDARD_OPERATORS.filter(
    (op, i) => op.employment_type === 'freelance' && selectedOperators.has(i)
  ).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Initialisation Opérateurs</h1>
        <p className="text-gray-600">Ajouter des opérateurs standards</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Operators List */}
        <div className="md:col-span-2 space-y-3">
          {STANDARD_OPERATORS.map((operator, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                selectedOperators.has(index) ? 'border-2 border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => toggleOperator(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOperators.has(index)}
                    onChange={() => toggleOperator(index)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {operator.first_name} {operator.last_name}
                      </h3>
                      <Badge
                        className={
                          operator.employment_type === 'salary'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }
                      >
                        {operator.employment_type === 'salary' ? 'Salarié' : 'Freelance'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      📧 {operator.email}
                      <br />
                      📱 {operator.phone}
                    </div>
                    <div className="text-sm font-medium">
                      Tarifs:
                      {operator.rates.map((rate, i) => (
                        <span key={i} className="ml-2 font-mono text-xs">
                          {rate.rate_type === 'monthly_salary'
                            ? `${rate.rate_amount}€/mois`
                            : rate.rate_type === 'daily'
                            ? `${rate.rate_amount}€/jour`
                            : rate.rate_type === 'hourly'
                            ? `${rate.rate_amount}€/h`
                            : `${rate.rate_amount}€/session`}
                          {i < operator.rates.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedOperators.has(index) && (
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
                {selectedOperators.size} / {STANDARD_OPERATORS.length} opérateurs sélectionnés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Counts */}
              <div className="bg-blue-50 p-3 rounded-lg border-border border-blue-200">
                <p className="text-sm text-gray-600">Salariés</p>
                <p className="text-2xl font-bold text-blue-600">{salaryCount}</p>
              </div>

              <div className="bg-card p-3 rounded-lg border-border border-border">
                <p className="text-sm text-gray-600">Freelances</p>
                <p className="text-2xl font-bold text-green-600">{freelanceCount}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t">
                <Button
                  className="w-full gap-2"
                  onClick={handleImportAll}
                  disabled={selectedOperators.size === 0 || importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Import...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Importer {selectedOperators.size}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/dashboard/operators')}
                >
                  Ignorer
                </Button>

                {/* Select all / None */}
                <div className="space-y-1 pt-2 border-t text-xs">
                  <button
                    onClick={() =>
                      setSelectedOperators(
                        new Set(STANDARD_OPERATORS.map((_, i) => i))
                      )
                    }
                    className="text-blue-600 hover:underline block w-full text-left"
                  >
                    ✓ Sélectionner tout
                  </button>
                  <button
                    onClick={() => setSelectedOperators(new Set())}
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
