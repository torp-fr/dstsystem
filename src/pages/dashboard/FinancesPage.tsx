import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from '@/hooks/useQuotes';
import { useCostStructures } from '@/hooks/useCostStructures';
import { useOperators } from '@/hooks/useOperators';
import { useShootingSessions } from '@/hooks/useShootingSessions';

const FinancesPage = () => {
  const navigate = useNavigate();

  // Get real data
  const { data: quotes = [] } = useQuotes();
  const { data: costs = [] } = useCostStructures();
  const { data: operators = [] } = useOperators();
  const { data: sessions = [] } = useShootingSessions();
  const invoices = []; // Mock for now - can be connected to Supabase later

  // Load settings from localStorage with defaults
  const [settings, setSettings] = useState({
    employeeChargesPercent: 42,
    employerChargesPercent: 45,
  });

  // Watch for changes in localStorage and update dynamically
  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('dst-system-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({
            employeeChargesPercent: parsed.employeeChargesPercent || 42,
            employerChargesPercent: parsed.employerChargesPercent || 45,
          });
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    };

    // Load on mount
    loadSettings();

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', loadSettings);

    // Poll for changes every 2 seconds to catch local updates
    const interval = setInterval(loadSettings, 2000);

    return () => {
      window.removeEventListener('storage', loadSettings);
      clearInterval(interval);
    };
  }, []);

  // Calculate metrics
  const totalMonthlyCosts = costs
    .filter((c: any) => c.is_active)
    .reduce((sum: number, c: any) => sum + (c.monthly_amount || 0), 0);

  const totalRevenue = quotes.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0);
  const paidInvoices = invoices.filter((i: any) => i.status === 'paid').length;
  const pendingInvoices = invoices.filter((i: any) => i.status === 'pending' || i.status === 'partial').length;
  const overdueInvoices = invoices.filter((i: any) => i.status === 'overdue').length;

  const netProfit = totalRevenue - totalMonthlyCosts;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Calculate salary costs using dynamic settings
  const activeOperators = operators.filter((o: any) => o.status === 'active').length;

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Finances</h1>
        <p className="text-xs text-muted-foreground">Suivi des revenus, dépenses et rentabilité</p>
      </div>

      {/* Main Stats - Simplified */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
        {/* Revenue */}
        <div className="bg-card rounded-lg border-border border p-3">
          <p className="text-xs text-muted-foreground mb-1">Revenus totaux</p>
          <p className="text-xl font-bold text-green-600">{totalRevenue.toFixed(0)}€</p>
          <p className="text-xs text-muted-foreground mt-1">{quotes.length} devis</p>
        </div>

        {/* Net Profit */}
        <div className="bg-card rounded-lg border-border border p-3">
          <p className="text-xs text-muted-foreground mb-1">Résultat net</p>
          <p className={`text-xl font-bold ${netProfit > 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {netProfit.toFixed(0)}€
          </p>
          <p className="text-xs text-muted-foreground mt-1">Marge: {profitMargin}%</p>
        </div>
      </div>

      {/* Financial Details Grid - Simplified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Salary Charges Analysis */}
        <div className="bg-card rounded-lg border-border border p-3">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Charges salariales
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opérateurs actifs:</span>
              <span className="font-medium">{activeOperators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charges patronales ({settings.employerChargesPercent}%):</span>
              <span className="font-medium text-red-600">Inclus dans coûts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charges salariées ({settings.employeeChargesPercent}%):</span>
              <span className="font-medium text-red-600">Inclus dans coûts</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between font-semibold">
              <span>Coût total opérateurs:</span>
              <span className="text-red-600">{totalMonthlyCosts.toFixed(0)}€/mois</span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1 italic">
              Taux synchronisés avec Paramètres
            </p>
          </div>
        </div>

        {/* Sessions & Performance */}
        <div className="bg-card rounded-lg border-border border p-3">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Performance des sessions
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessions planifiées:</span>
              <span className="font-medium">{sessions.filter((s: any) => s.status === 'scheduled').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessions complétées:</span>
              <span className="font-medium text-green-600">{sessions.filter((s: any) => s.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux de réalisation:</span>
              <span className="font-medium">
                {sessions.length > 0 ? ((sessions.filter((s: any) => s.status === 'completed').length / sessions.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between font-semibold">
              <span>Coût moyen/session:</span>
              <span className="text-orange-600">
                {sessions.length > 0 ? (totalMonthlyCosts / sessions.length).toFixed(0) : 0}€
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinancesPage;
