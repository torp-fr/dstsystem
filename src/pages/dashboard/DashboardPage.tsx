import { Users, TrendingUp, Package, DollarSign } from 'lucide-react';

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
          value="0"
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
          label="Rentabilité"
          value="-"
          color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Coming Soon Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Clients récents</h2>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-50" />
            <p>Aucun client enregistré</p>
            <p className="text-sm mt-1">Commencez par ajouter vos premiers clients</p>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Aperçu financier</h2>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mb-3 opacity-50" />
            <p>Aucune transaction enregistrée</p>
            <p className="text-sm mt-1">Les données apparaîtront ici</p>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-4">Activité récente</h2>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>Aucune activité enregistrée</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🚀 Phase 1 en cours</h3>
        <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
          Le tableau de bord est en cours de développement. Les fonctionnalités de gestion des clients, des offres et des finances seront disponibles prochainement.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
