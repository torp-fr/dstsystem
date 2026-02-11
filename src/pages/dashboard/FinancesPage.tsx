import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FinancesPage = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data from Supabase
  const finances = {
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    profitability: 0,
    invoices: { total: 0, paid: 0, pending: 0, overdue: 0 },
  };

  const profitMargin = finances.monthlyRevenue > 0
    ? ((finances.monthlyRevenue - finances.monthlyExpenses) / finances.monthlyRevenue * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Finances</h1>
        <p className="text-muted-foreground mt-2">Suivi des revenus, dépenses et rentabilité</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Revenus ce mois</p>
              <p className="text-3xl font-bold">{finances.monthlyRevenue.toFixed(2)} €</p>
              <p className="text-xs text-muted-foreground mt-2">({finances.invoices.paid} factures payées)</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Dépenses ce mois</p>
              <p className="text-3xl font-bold">{finances.monthlyExpenses.toFixed(2)} €</p>
              <p className="text-xs text-muted-foreground mt-2">(fonctionnement + amortissements)</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Bénéfice net</p>
              <p className="text-3xl font-bold">
                {(finances.monthlyRevenue - finances.monthlyExpenses).toFixed(2)} €
              </p>
              <p className="text-xs text-muted-foreground mt-2">Marge: {profitMargin}%</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Profitability */}
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rentabilité globale</p>
              <p className="text-3xl font-bold">{finances.profitability.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-2">Sur l'année</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PieChart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices */}
        <div className="lg:col-span-2 bg-card rounded-xl border-border border-border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Factures</h2>
            <Button className="bg-primary hover:bg-primary/90">
              Nouvelle facture
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{finances.invoices.total}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Payées</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{finances.invoices.paid}</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10">
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">En attente</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{finances.invoices.pending}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10">
              <p className="text-sm text-red-600 dark:text-red-400 mb-1">En retard</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{finances.invoices.overdue}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mb-3 opacity-50" />
            <p>Aucune facture enregistrée</p>
            <p className="text-sm mt-1">Commencez par ajouter une facture</p>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Dépenses</h2>
            <Button variant="outline" size="sm">
              + Ajouter
            </Button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground mb-1">Séances de tir</p>
              <p className="text-lg font-bold">0 €</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground mb-1">Amortissements</p>
              <p className="text-lg font-bold">0 €</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground mb-1">Fonctionnement</p>
              <p className="text-lg font-bold">0 €</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground mb-1">Autres</p>
              <p className="text-lg font-bold">0 €</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <h3 className="text-lg font-bold mb-4">📊 Rapports financiers</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Génération automatique de rapports mensuels, trimestriels et annuels.
          </p>
          <Button variant="outline" disabled className="w-full">
            À venir en Phase 2
          </Button>
        </div>

        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <h3 className="text-lg font-bold mb-4">📈 Projections</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Prévisions de cash flow et analyses de rentabilité par prestations.
          </p>
          <Button variant="outline" disabled className="w-full">
            À venir en Phase 2
          </Button>
        </div>

        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <h3 className="text-lg font-bold mb-4">💰 Tarification</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Calcul automatique des tarifs planchers basés sur les coûts et marges.
          </p>
          <Button variant="outline" disabled className="w-full">
            À venir en Phase 2
          </Button>
        </div>

        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <h3 className="text-lg font-bold mb-4">📉 Analyse</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Analyse détaillée par client, par prestation, par période.
          </p>
          <Button variant="outline" disabled className="w-full">
            À venir en Phase 2
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border-border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">💡 Phase 1 - Foundation</h3>
        <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
          Le dashboard financier est préparé pour la Phase 2. Vous pouvez commencer à enregistrer vos factures et dépenses.
          Les rapports et projections seront disponibles dans les prochaines phases.
        </p>
      </div>
    </div>
  );
};

export default FinancesPage;
