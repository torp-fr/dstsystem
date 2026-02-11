import { useSessions, useAnalyticsStats } from '@/hooks/useAnalytics';
import { Globe, MapPin, Users, Eye } from 'lucide-react';

const AnalyticsPage = () => {
  const { data: sessions = [], isLoading } = useSessions();
  const stats = useAnalyticsStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Suivi des visites et de l'activité du site</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pages visitées</p>
              <p className="text-3xl font-bold">{stats.totalPageVisits}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Eye className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Sessions</p>
              <p className="text-3xl font-bold">{stats.totalSessions}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pays uniques</p>
              <p className="text-3xl font-bold">{stats.uniqueCountries.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
              <Globe className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Connexions</p>
              <p className="text-3xl font-bold">{sessions.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map of Connections */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Localisation des connexions</h2>
          <div className="bg-secondary/20 rounded-lg p-4 min-h-96 flex items-center justify-center">
            {sessions.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune donnée de géolocalisation</p>
              </div>
            ) : (
              <div className="w-full space-y-3">
                <p className="text-sm font-medium mb-4">
                  Connexions par localisation ({sessions.length} total)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {sessions
                    .filter((s: any) => s.country || s.city)
                    .map((session: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {session.city}, {session.country}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Coordonnées: {session.latitude?.toFixed(2)}, {session.longitude?.toFixed(2)}
                          </p>
                          <p>Appareil: {session.device_type}</p>
                          <p>Navigateur: {session.browser}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            💡 Tip: Une intégration Leaflet/MapBox pourra afficher une vraie carte interactive dans Phase 2
          </p>
        </div>

        {/* Top Pages */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Pages les plus visitées</h2>
          {stats.topPages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune visite enregistrée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(stats.topPages as any[]).map((page: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{page[0]}</p>
                      <p className="text-xs text-muted-foreground">{page[1]} visites</p>
                    </div>
                    <div className="flex-shrink-0 w-12 h-6 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{page[1]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visits by Country */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-4">Visites par pays</h2>
        {stats.visitsByCountry.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune visite enregistrée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(stats.visitsByCountry as any[]).map((country: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-secondary/20 text-center">
                <p className="text-lg font-bold text-primary">{country[1]}</p>
                <p className="text-sm text-muted-foreground">{country[0]}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">📊 Analytics en temps réel</h3>
        <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
          Le suivi des visites est activé sur toutes les pages du site. Les données se mettent à jour en temps réel.
          Une intégration de carte interactive sera ajoutée dans les phases suivantes.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
