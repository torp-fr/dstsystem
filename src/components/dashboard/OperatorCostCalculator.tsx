import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CostBreakdown {
  hourlyNet?: number;
  dailyNet?: number;
  hourlyGross?: number;
  dailyGross?: number;
  employeeCharges?: number;
  employerCharges?: number;
  companyCost?: number;
}

interface ContractComparison {
  type: string;
  label: string;
  dailyCost: number;
  hourlyCost: number;
  monthlyCost: number;
  breakdown: CostBreakdown;
}

export const OperatorCostCalculator = () => {
  const [baseSalary, setBaseSalary] = useState(2500); // Monthly salary
  const [hourlyRate, setHourlyRate] = useState(150); // Freelance daily rate
  const [dailyRate, setDailyRate] = useState(25); // Freelance hourly rate
  const [employeeChargesPercent] = useState(42); // Fixed for France
  const [employerChargesPercent] = useState(45); // Fixed for France

  // French labor constants
  const HOURS_PER_DAY = 8;
  const DAYS_PER_MONTH = 21.67;
  const HOURS_PER_MONTH = HOURS_PER_DAY * DAYS_PER_MONTH;

  // Calculate costs for different contract types
  const calculateSalaryContractCosts = (monthlySalary: number): ContractComparison => {
    const hourlyNet = monthlySalary / HOURS_PER_MONTH;
    const dailyNet = hourlyNet * HOURS_PER_DAY;

    // Calculate gross salary from net
    const dailyGross = dailyNet / (1 - employeeChargesPercent / 100);
    const hourlyGross = hourlyNet / (1 - employeeChargesPercent / 100);

    // Employee contributions
    const dailyEmployeeCharges = dailyGross * (employeeChargesPercent / 100);

    // Employer charges (on gross)
    const dailyEmployerCharges = dailyGross * (employerChargesPercent / 100);

    // Total company cost (gross + employer charges)
    const dailyCompanyCost = dailyGross + dailyEmployerCharges;

    return {
      type: 'salary',
      label: 'Contrat CDI/CDD',
      dailyCost: dailyCompanyCost,
      hourlyCost: dailyCompanyCost / HOURS_PER_DAY,
      monthlyCost: monthlySalary * (1 + employerChargesPercent / 100),
      breakdown: {
        hourlyNet,
        dailyNet,
        hourlyGross,
        dailyGross,
        employeeCharges: dailyEmployeeCharges,
        employerCharges: dailyEmployerCharges,
        companyCost: dailyCompanyCost,
      },
    };
  };

  const calculateFreelanceContractCosts = (dailyRate: number): ContractComparison => {
    return {
      type: 'freelance',
      label: 'Freelance (à la journée)',
      dailyCost: dailyRate,
      hourlyCost: dailyRate / HOURS_PER_DAY,
      monthlyCost: dailyRate * DAYS_PER_MONTH,
      breakdown: {
        dailyNet: dailyRate,
        companyCost: dailyRate,
      },
    };
  };

  const calculateHourlyFreelanceContractCosts = (hourlyRate: number): ContractComparison => {
    const dailyRate = hourlyRate * HOURS_PER_DAY;
    return {
      type: 'freelance_hourly',
      label: 'Freelance (à l\'heure)',
      dailyCost: dailyRate,
      hourlyCost: hourlyRate,
      monthlyCost: hourlyRate * HOURS_PER_MONTH,
      breakdown: {
        hourlyCost: hourlyRate,
        dailyNet: dailyRate,
        companyCost: dailyRate,
      },
    };
  };

  const comparisons: ContractComparison[] = [
    calculateSalaryContractCosts(baseSalary),
    calculateFreelanceContractCosts(dailyRate),
    calculateHourlyFreelanceContractCosts(hourlyRate),
  ];

  const cheapestIndex = comparisons.reduce(
    (minIndex, current, index) => (current.dailyCost < comparisons[minIndex].dailyCost ? index : minIndex),
    0
  );

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de coûts</CardTitle>
          <CardDescription>Configurez les barèmes pour comparer les types de contrats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="salary">Salaire mensuel net (€)</Label>
              <Input
                id="salary"
                type="number"
                min="1000"
                step="100"
                value={baseSalary}
                onChange={(e) => setBaseSalary(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily">Tarif journalier freelance (€)</Label>
              <Input
                id="daily"
                type="number"
                min="50"
                step="10"
                value={dailyRate}
                onChange={(e) => setDailyRate(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly">Tarif horaire freelance (€)</Label>
              <Input
                id="hourly"
                type="number"
                min="15"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <p className="text-blue-900">
              <strong>Charges sociales France:</strong> Charges salariales {employeeChargesPercent}% • Charges patronales {employerChargesPercent}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des coûts</CardTitle>
          <CardDescription>Le coût le moins cher par jour est mis en évidence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Type de contrat</th>
                  <th className="text-right py-3 px-4">Coût/Jour</th>
                  <th className="text-right py-3 px-4">Coût/Heure</th>
                  <th className="text-right py-3 px-4">Coût/Mois</th>
                  <th className="text-right py-3 px-4">Avantage</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comp, index) => (
                  <tr
                    key={comp.type}
                    className={`border-b ${index === cheapestIndex ? 'bg-green-50' : ''}`}
                  >
                    <td className="py-3 px-4 font-medium">{comp.label}</td>
                    <td className={`text-right py-3 px-4 font-mono ${index === cheapestIndex ? 'font-bold text-green-600' : ''}`}>
                      {comp.dailyCost.toFixed(2)}€
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {comp.hourlyCost.toFixed(2)}€
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {comp.monthlyCost.toFixed(2)}€
                    </td>
                    <td className="text-right py-3 px-4">
                      {index === cheapestIndex && (
                        <Badge className="bg-green-600">Moins cher</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisons.map((comp, index) => (
          <Card
            key={comp.type}
            className={index === cheapestIndex ? 'border-green-200 bg-green-50' : ''}
          >
            <CardHeader>
              <CardTitle className="text-lg">{comp.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {comp.breakdown.hourlyNet && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net horaire</span>
                  <span className="font-mono font-semibold">{comp.breakdown.hourlyNet.toFixed(2)}€</span>
                </div>
              )}
              {comp.breakdown.dailyNet && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net journalier</span>
                  <span className="font-mono font-semibold">{comp.breakdown.dailyNet.toFixed(2)}€</span>
                </div>
              )}
              {comp.breakdown.hourlyGross && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brut horaire</span>
                  <span className="font-mono font-semibold">{comp.breakdown.hourlyGross.toFixed(2)}€</span>
                </div>
              )}
              {comp.breakdown.dailyGross && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brut journalier</span>
                  <span className="font-mono font-semibold">{comp.breakdown.dailyGross.toFixed(2)}€</span>
                </div>
              )}
              {comp.breakdown.employeeCharges && (
                <div className="flex justify-between text-orange-600">
                  <span>Charges salariales</span>
                  <span className="font-mono font-semibold">{comp.breakdown.employeeCharges.toFixed(2)}€</span>
                </div>
              )}
              {comp.breakdown.employerCharges && (
                <div className="flex justify-between text-red-600">
                  <span>Charges patronales</span>
                  <span className="font-mono font-semibold">{comp.breakdown.employerCharges.toFixed(2)}€</span>
                </div>
              )}
              {comp.breakdown.companyCost && (
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold bg-gray-100 p-2 rounded">
                  <span>Coût total entreprise/jour</span>
                  <span className="font-mono text-lg">{comp.breakdown.companyCost.toFixed(2)}€</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p>
              <strong>💡 Calcul français:</strong> Les charges salariales (42%) et patronales (45%) sont basées sur les barèmes français actuels et peuvent varier selon l'affiliation (privé/public).
            </p>
            <p>
              <strong>💰 Coût total entreprise:</strong> Inclut le salaire brut + charges patronales pour un salarié.
            </p>
            <p>
              <strong>🎯 Freelance:</strong> Aucune charge sociale (à l'opérateur de déclarer ses revenus).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorCostCalculator;
