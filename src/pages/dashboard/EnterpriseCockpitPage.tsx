import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PlanningSessionCard from '@/components/planning/PlanningSessionCard';
import SkeletonCard from '@/components/common/SkeletonCard';
import { AlertCircle, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useRuntimeHealth, getHealthIndicator, getOverallHealth } from '@/hooks/useRuntimeHealth';
import { getPlanningSessionsSafe } from '@/services/planningBridge.service';
import { useQuotes } from '@/hooks/useQuotes';
import { useCostStructures } from '@/hooks/useCostStructures';
import { useOperators } from '@/hooks/useOperators';

/**
 * EnterpriseCockpitPage — Operations Command Center
 *
 * Two-tab view:
 * 1. OPERATIONS — Alerts + Upcoming planning
 * 2. FINANCES — Revenue, costs, operators
 *
 * PURE READ-ONLY LAYER - no business logic, no automation
 */

interface PlanningSession {
  id: string;
  date: string;
  regionId: string;
  clientId: string;
  status: string;
  marketplaceVisible: boolean;
  setupIds: string[];
  staffing: {
    minOperators: number;
    acceptedOperators: number;
    pendingApplications: number;
    isOperational: boolean;
  };
}

export default function EnterpriseCockpitPage() {
  const [sessions, setSessions] = useState<PlanningSession[]>([]);
  const [loading, setLoading] = useState(false);
  const health = useRuntimeHealth();
  const overallHealth = getOverallHealth(health);
  const healthIndicator = getHealthIndicator(overallHealth);

  // Finance data
  const { data: quotes = [] } = useQuotes();
  const { data: costs = [] } = useCostStructures();
  const { data: operators = [] } = useOperators();

  // ============================================================
  // FETCH SESSIONS DATA
  // ============================================================

  useEffect(() => {
    setLoading(true);

    try {
      const result = getPlanningSessionsSafe();

      if (!result) {
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSessions(result.sessions || []);
      } else {
        setSessions([]);
      }
    } catch (err) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // OPERATIONS DATA — Alerts & Upcoming
  // ============================================================

  // ALERTS: Sessions needing action
  const alerts = sessions.filter(
    s => s.status === 'pending_confirmation' || !s.staffing.isOperational
  );

  // UPCOMING: Sessions sorted by date (next ones first)
  const upcomingSessions = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Show next 5

  // ============================================================
  // FINANCES DATA
  // ============================================================

  const totalRevenue = quotes.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0);
  const totalMonthlyCosts = costs
    .filter((c: any) => c.is_active)
    .reduce((sum: number, c: any) => sum + (c.monthly_amount || 0), 0);
  const netProfit = totalRevenue - totalMonthlyCosts;
  const activeOperators = operators.filter((o: any) => o.status === 'active').length;

  // ============================================================
  // PAGE RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cockpit</h1>
          <p className="text-muted-foreground mt-1">Centre de pilotage opérationnel</p>
        </div>

        {/* System Health */}
        <div className="flex flex-col items-end gap-0.5">
          <div className="text-xs text-muted-foreground font-medium opacity-50">
            État système
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-lg border text-xs"
            style={{ borderColor: healthIndicator.color, opacity: 0.6 }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: healthIndicator.color }}
            />
            <span className="text-muted-foreground font-medium">
              {healthIndicator.label === 'ok' ? 'Nominal' :
               healthIndicator.label === 'degraded' ? 'Dégradé' :
               'Alerte'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="operations" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="operations" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Opérations
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* TAB: OPERATIONS */}
        <TabsContent value="operations" className="flex-1 space-y-6">
          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col gap-12">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="bg-muted animate-pulse rounded-lg border p-4 h-16" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SkeletonCard count={2} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <>
              {/* BLOC A: ACTIONS REQUISES */}
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border p-4 bg-destructive/5 border-destructive/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <h2 className="text-lg font-semibold text-destructive">
                      Actions Requises
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alerts.length > 0 ? `${alerts.length} session(s) en attente` : 'Aucune action requise'}
                  </p>
                </div>

                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
                    <Badge variant="outline" className="mx-auto">Aucune action requise</Badge>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {alerts.map(session => (
                      <PlanningSessionCard key={session.id} session={session} />
                    ))}
                  </div>
                )}
              </div>

              {/* BLOC B: MISSIONS PROCHAINES */}
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border p-4 bg-blue-600/5 border-blue-600/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      Missions Prochaines
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {upcomingSessions.length > 0 ? `${upcomingSessions.length} sessions programmées` : 'Aucune session prochaine'}
                  </p>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
                    <p>Aucune session programmée</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {upcomingSessions.map(session => (
                      <PlanningSessionCard key={session.id} session={session} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* TAB: PERFORMANCE */}
        <TabsContent value="performance" className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Revenue Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Chiffre d'affaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {totalRevenue.toFixed(0)}€
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {quotes.length} devis
                </p>
              </CardContent>
            </Card>

            {/* Net Profit Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Résultat net
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {netProfit.toFixed(0)}€
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Coûts: {totalMonthlyCosts.toFixed(0)}€/mois
                </p>
              </CardContent>
            </Card>

            {/* Active Operators Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Opérateurs actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {activeOperators}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {operators.length} total
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
