import React, { useEffect, useState } from 'react';
import { CalendarX } from 'lucide-react';
import MarketplaceSessionCard from './MarketplaceSessionCard';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';

/**
 * MarketplaceDashboard — Operator Marketplace Interface
 *
 * PURE UI LAYER:
 * - Reads ONLY from BookingFlowController.getMarketplaceSessions()
 * - Displays marketplace sessions
 * - Handles operator apply action (via MarketplaceController)
 * - NO business logic, NO automation
 */

interface MarketplaceSession {
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

export default function MarketplaceDashboard() {
  const [sessions, setSessions] = useState<MarketplaceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationRefresh, setApplicationRefresh] = useState(0);

  // ============================================================
  // FETCH MARKETPLACE SESSIONS ON MOUNT
  // ============================================================

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Call controller to get marketplace sessions
      const result = (window as any).BookingFlowController?.getMarketplaceSessions({
        limit: 50
      });

      if (!result) {
        setError('Le service n\'est pas initialisé');
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSessions(result.sessions || []);
      } else {
        setError(result.error || 'Impossible de charger les opportunités');
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [applicationRefresh]);

  // ============================================================
  // HANDLE APPLICATION
  // ============================================================

  const handleApply = (sessionId: string) => {
    // Refresh to show updated status
    setApplicationRefresh(prev => prev + 1);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Opportunités</h1>
        <p className="text-muted-foreground mt-1">
          Sessions ouvertes auxquelles vous pouvez candidater
        </p>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SkeletonCard count={6} />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && sessions.length === 0 && !error && (
        <EmptyState
          icon={CalendarX}
          title="Aucune session disponible actuellement"
          description="Revenez plus tard ou contactez l'entreprise pour découvrir les nouvelles opportunités."
        />
      )}

      {/* SESSIONS GRID */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(session => (
            <MarketplaceSessionCard
              key={session.id}
              session={session}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {/* INFO TEXT */}
      {!loading && sessions.length > 0 && (
        <div className="mt-8 p-4 bg-blue-600/5 rounded-lg border border-blue-600/30">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Comment ça marche :</strong> Cliquez sur « Candidater » pour exprimer votre intérêt.
            L'entreprise examinera votre candidature et vous notifiera du résultat.
          </p>
        </div>
      )}
    </div>
  );
}
