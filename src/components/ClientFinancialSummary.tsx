import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientFinancials } from '@/hooks/useClientFinancials';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface ClientFinancialSummaryProps {
  clientId: string;
}

export default function ClientFinancialSummary({ clientId }: ClientFinancialSummaryProps) {
  const { data: financials, isLoading } = useClientFinancials(clientId);

  if (isLoading || !financials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse financière</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  const isProfit = financials.totalMargin >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse financière</CardTitle>
        <CardDescription>CA, coûts et marge réalisés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Revenue */}
          <div className="bg-card border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">CA généré</p>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {financials.totalRevenue.toFixed(0)}€
            </p>
          </div>

          {/* Costs */}
          <div className="bg-card border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Coûts</p>
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {financials.totalCosts.toFixed(0)}€
            </p>
          </div>

          {/* Margin */}
          <div
            className={`bg-card border rounded-lg p-4 ${
              isProfit
                ? 'border-emerald-500/30'
                : 'border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Marge</p>
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            <p
              className={`text-2xl font-bold ${
                isProfit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {financials.totalMargin.toFixed(0)}€
            </p>
          </div>

          {/* Margin % */}
          <div className="bg-card border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">% Marge</p>
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {financials.marginPercentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-card/50 rounded p-3">
            <p className="text-xs text-muted-foreground mb-1">Sessions complétées</p>
            <p className="text-lg font-semibold">{financials.completedSessions}</p>
          </div>
          <div className="bg-card/50 rounded p-3">
            <p className="text-xs text-muted-foreground mb-1">Sessions prévues</p>
            <p className="text-lg font-semibold">{financials.scheduledSessions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
