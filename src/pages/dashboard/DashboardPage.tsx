import { useClients } from '@/hooks/useClients';
import { useOperators } from '@/hooks/useOperators';
import { useCostStructures } from '@/hooks/useCostStructures';
import { useShootingSessions } from '@/hooks/useShootingSessions';
import { useQuotes } from '@/hooks/useQuotes';
import { Users, TrendingUp, Package, DollarSign, Crosshair, Calculator, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de votre entreprise DST-System</p>
      </div>

      {/* Stats Grid - Phase 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Clients actifs"
          value={activeClients}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Package}
          label="Offres actives"
          value="0"
          color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          icon={DollarSign}
          label="Revenus ce mois"
          value="0 €"
          color="bg-green-500/10 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Prospects"
          value={prospectClients}
          color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Stats Grid - Phase 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Crosshair}
          label="Opérateurs actifs"
          value={activeOperators}
          color="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          icon={Calculator}
          label="Coûts mensuels"
          value={`${totalMonthlyCosts.toFixed(0)}€`}
          color="bg-red-500/10 text-red-600 dark:text-red-400"
        />
        <StatCard
          icon={Calendar}
          label="Sessions prévues"
          value={upcomingSessions.length}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={FileText}
          label="Devis récents"
          value={recentQuotes.length}
          color="bg-green-500/10 text-green-600 dark:text-green-400"
        />
      </div>

      {/* Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients List */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Derniers clients</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/clients')}
            >
              Voir tout
            </Button>
          </div>
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p>Aucun client enregistré</p>
              <Button
                className="mt-4 bg-primary hover:bg-primary/90"
                onClick={() => navigate('/dashboard/clients/new')}
              >
                Ajouter un client
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 5).map((client: any) => (
                <div
                  key={client.id}
                  className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/dashboard/clients')}
                >
                  <p className="font-medium">
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{client.email || client.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Statistiques des clients</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-muted-foreground">Total des clients</span>
              <span className="font-bold text-lg">{totalClients}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
              <span className="text-green-600 dark:text-green-400">Clients actifs</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">{activeClients}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
              <span className="text-blue-600 dark:text-blue-400">Prospects</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{prospectClients}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Sessions prévues</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/calendar')}
          >
            Voir tout
          </Button>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-3 opacity-50" />
            <p>Aucune session prévue cette semaine</p>
            <Button
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/dashboard/calendar')}
            >
              Ajouter une session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.slice(0, 5).map((session: any) => (
              <div
                key={session.id}
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{session.theme || 'Session'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.session_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant="secondary">{session.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Quotes */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Devis récents</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/quotes')}
          >
            Voir tout
          </Button>
        </div>
        {recentQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p>Aucun devis créé</p>
            <Button
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/dashboard/quotes/new')}
            >
              Créer un devis
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuotes.map((quote: any) => (
              <div
                key={quote.id}
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/quotes/${quote.id}/edit`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{quote.quote_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.total_amount.toFixed(2)}€
                    </p>
                  </div>
                  <Badge>{quote.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button
            className="bg-primary hover:bg-primary/90 justify-start"
            onClick={() => navigate('/dashboard/clients/new')}
          >
            <Users className="h-4 w-4 mr-2" />
            Client
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => navigate('/dashboard/operators')}
          >
            <Crosshair className="h-4 w-4 mr-2" />
            Opérateur
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => navigate('/dashboard/calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Session
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => navigate('/dashboard/quotes/new')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Devis
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => navigate('/dashboard/costs')}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Coûts
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => navigate('/dashboard/deposits/new')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Acompte
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
        <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Phase 2 - Gestion Complète Disponible</h3>
        <p className="text-sm text-green-600/80 dark:text-green-400/80">
          Vous pouvez désormais gérer les opérateurs, les coûts, les sessions, les devis, les factures, les avenants et les acomptes. Utilisez le menu latéral pour accéder à tous les modules.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
