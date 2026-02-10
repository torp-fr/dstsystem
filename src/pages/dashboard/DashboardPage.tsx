import { useClients } from '@/hooks/useClients';
import { Users, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

  const totalClients = clients.length;
  const activeClients = clients.filter((c: any) => c.status === 'active').length;
  const prospectClients = clients.filter((c: any) => c.status === 'prospect').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de votre entreprise DST-System</p>
      </div>

      {/* Stats Grid */}
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

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            className="bg-primary hover:bg-primary/90 justify-start"
            onClick={() => navigate('/dashboard/clients/new')}
          >
            <Users className="h-4 w-4 mr-2" />
            Ajouter un client
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => navigate('/dashboard/clients')}
          >
            <Users className="h-4 w-4 mr-2" />
            Gérer les clients
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">✅ Gestion des clients disponible</h3>
        <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
          Vous pouvez désormais ajouter et gérer vos clients. Les fonctionnalités de gestion des offres et des finances seront disponibles prochainement.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
