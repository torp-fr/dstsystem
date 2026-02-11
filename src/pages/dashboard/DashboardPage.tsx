import { useClients } from '@/hooks/useClients';
import { useOperators } from '@/hooks/useOperators';
import { useCostStructures } from '@/hooks/useCostStructures';
import { useShootingSessions } from '@/hooks/useShootingSessions';
import { useQuotes } from '@/hooks/useQuotes';
import { Users, TrendingUp, Package, DollarSign, Crosshair, Calculator, Calendar, FileText, AlertCircle, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
  <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/30 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <span className={`text-xs font-semibold flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: clients = [] } = useClients();
  const { data: operators = [] } = useOperators();
  const { data: costs = [] } = useCostStructures();
  const { data: sessions = [] } = useShootingSessions();
  const { data: quotesData = [] } = useQuotes();

  const totalClients = clients.length;
  const activeClients = clients.filter((c: any) => c.status === 'active').length;
  const prospectClients = clients.filter((c: any) => c.status === 'prospect').length;

  // Phase 2 Stats
  const totalOperators = operators.length;
  const activeOperators = operators.filter((o: any) => o.status === 'active').length;
  const totalMonthlyCosts = costs
    .filter((c: any) => c.is_active)
    .reduce((sum: number, c: any) => sum + (c.monthly_amount || 0), 0);

  // Upcoming sessions (next 7 days)
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const upcomingSessions = sessions.filter(
    (s: any) => s.session_date >= today && s.session_date <= nextWeek
  );

  // Recent quotes
  const recentQuotes = quotesData.slice(0, 3);

  // Calculate operational metrics for decision-support
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s: any) => s.status === 'scheduled').length;
  const completedSessions = sessions.filter((s: any) => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Support opérationnel et aide au pilotage</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase font-semibold text-muted-foreground">Statut</p>
          <Badge className="bg-green-600 mt-1">🟢 Système Actif</Badge>
        </div>
      </div>

      {/* Operational Health Overview - 16:9 optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <StatCard
          icon={Users}
          label="Clients actifs / Total"
          value={`${activeClients}/${totalClients}`}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          trend={totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0}
        />
        <StatCard
          icon={Crosshair}
          label="Opérateurs actifs / Total"
          value={`${activeOperators}/${totalOperators}`}
          color="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          trend={totalOperators > 0 ? Math.round((activeOperators / totalOperators) * 100) : 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Prospects en attente"
          value={prospectClients}
          color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <StatCard
          icon={DollarSign}
          label="Coûts mensuels"
          value={`${totalMonthlyCosts.toFixed(0)}€`}
          color="bg-red-500/10 text-red-600 dark:text-red-400"
        />
        <StatCard
          icon={Calendar}
          label="Sessions à venir"
          value={upcomingSessions.length}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={FileText}
          label="Devis en cours"
          value={recentQuotes.length}
          color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Operational Alerts Section */}
      {(upcomingSessions.length === 0 || activeClients === 0) && (
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
            {upcomingSessions.length === 0 && activeClients > 0 && "⚠️ Aucune session prévue cette semaine. "}
            {activeClients === 0 && "📋 Commencez par ajouter des clients pour créer des sessions."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid - 16:9 Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upcoming Sessions - Wider Column */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold">Sessions à venir (7 jours)</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/calendar')}
              className="text-xs"
            >
              Voir calendrier →
            </Button>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Calendar className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Aucune session prévue</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.slice(0, 4).map((session: any) => (
                <div
                  key={session.id}
                  className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 hover:border-amber-400/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{session.theme || 'Session sans titre'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.session_date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{session.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients - Side Column */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold">Derniers clients</h2>
          </div>
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Aucun client</p>
              <Button
                size="sm"
                className="mt-3 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/dashboard/clients/new')}
              >
                Ajouter
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.slice(0, 5).map((client: any) => (
                <div
                  key={client.id}
                  className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors cursor-pointer text-sm"
                  onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                >
                  <p className="font-medium">{client.first_name} {client.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{client.email || client.phone}</p>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/clients')}
                className="w-full mt-2"
              >
                Voir tous ({totalClients})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Quotes & Financial Overview - 16:9 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Quotes */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-bold">Devis et factures récents</h2>
          </div>
          {recentQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <FileText className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Aucun devis créé</p>
              <Button
                size="sm"
                className="mt-3 bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/dashboard/quotes/new')}
              >
                Créer un devis
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQuotes.slice(0, 3).map((quote: any) => (
                <div
                  key={quote.id}
                  className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/quotes/${quote.id}/edit`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{quote.quote_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm">{quote.total_amount.toFixed(2)}€</p>
                      <Badge variant="outline" className="text-xs">{quote.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/quotes')}
                className="w-full mt-2"
              >
                Voir tous les devis
              </Button>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg border border-green-200 dark:border-green-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-bold">Résumé financier</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Chiffre d'affaires (devis)</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {recentQuotes.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0).toFixed(0)}€
              </p>
              <p className="text-xs text-muted-foreground mt-1">{recentQuotes.length} devis</p>
            </div>
            <div className="h-px bg-border opacity-50" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Coûts mensuels</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalMonthlyCosts.toFixed(0)}€
              </p>
              <p className="text-xs text-muted-foreground mt-1">Opérateurs et structure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Compact 16:9 Layout */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Actions rapides</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex flex-col gap-2 py-6"
            onClick={() => navigate('/dashboard/clients/new')}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Client</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 py-6"
            onClick={() => navigate('/dashboard/operators')}
          >
            <Crosshair className="h-5 w-5" />
            <span className="text-xs font-medium">Opérateur</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 py-6"
            onClick={() => navigate('/dashboard/calendar')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Session</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 py-6"
            onClick={() => navigate('/dashboard/quotes/new')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Devis</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 py-6"
            onClick={() => navigate('/dashboard/costs')}
          >
            <Calculator className="h-5 w-5" />
            <span className="text-xs font-medium">Coûts</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 py-6"
            onClick={() => navigate('/dashboard/operators/analysis')}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-medium">Analyse</span>
          </Button>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Alert className="border-green-500/30 bg-green-50/50 dark:bg-green-500/10 lg:col-span-2">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
            <strong>✅ Système actif</strong> • Tous les modules opérationnels (Clients, Opérateurs, Sessions, Devis, Factures, Avenants, Acomptes)
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/operators/analysis')}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          Analyse comparative coûts
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
