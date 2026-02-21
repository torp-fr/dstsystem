import { useClients } from '@/hooks/useClients';
import { useOperators } from '@/hooks/useOperators';
import { useCostStructures } from '@/hooks/useCostStructures';
import { useShootingSessions } from '@/hooks/useShootingSessions';
import { useQuotes } from '@/hooks/useQuotes';
import { Users, TrendingUp, Package, DollarSign, Crosshair, Calculator, Calendar, FileText, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
  <div className="bg-card rounded-lg border-border border-border-border p-4 hover:border-primary/30 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold">{value}</p>
          {trend && (
            <span className={`text-xs font-semibold flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>
        <Icon className="h-4 w-4" />
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
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm">Suivez l'avancement et préparez vos prochaines sessions</p>
        </div>
      </div>


      {/* Main Content Grid - Simple Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Sessions */}
        <div className="bg-card rounded-lg border-border border-border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold">Mes prochaines sessions</h2>
            </div>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">Aucune session prévue</p>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingSessions.slice(0, 3).map((session: any) => (
                <div
                  key={session.id}
                  className="p-2 rounded-lg bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-500/10 border-border border-amber-200/50 dark:border-amber-500/20 hover:border-amber-400/50 transition-colors cursor-pointer"
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

        {/* Recent Clients */}
        <div className="bg-card rounded-lg border-border border-border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold">Clients récents</h2>
          </div>
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">Aucun client</p>
              <Button
                size="sm"
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs"
                onClick={() => navigate('/dashboard/clients/new')}
              >
                Ajouter
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {clients.slice(0, 4).map((client: any) => (
                <div
                  key={client.id}
                  className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors cursor-pointer text-xs"
                  onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                >
                  <p className="font-medium text-sm">{client.first_name} {client.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{client.email || client.phone}</p>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/clients')}
                className="w-full text-xs"
              >
                Voir tous ({totalClients})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Available Operators */}
      <div className="bg-card rounded-lg border-border border-border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-bold">Opérateurs disponibles</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/operators')}
            className="text-xs"
          >
            Voir tous →
          </Button>
        </div>
        {operators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Crosshair className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Aucun opérateur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {operators.slice(0, 4).map((operator: any) => (
              <div
                key={operator.id}
                className="p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/operators/${operator.id}`)}
              >
                <p className="font-medium text-sm">{operator.first_name} {operator.last_name}</p>
                <p className="text-xs text-muted-foreground">{operator.status || 'Disponible'}</p>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default DashboardPage;
