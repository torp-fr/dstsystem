import React, { useEffect, useState } from 'react';
import MarketplaceSessionCard from './MarketplaceSessionCard';
import MarketplaceEmptyState from './MarketplaceEmptyState';

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
        setError('Service not initialized');
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSessions(result.sessions || []);
      } else {
        setError(result.error || 'Failed to load marketplace sessions');
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
        <h1 className="text-3xl font-bold text-gray-800">Marketplace Sessions</h1>
        <p className="text-gray-600 mt-1">
          Browse available sessions and submit your applications
        </p>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading marketplace sessions...
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && sessions.length === 0 && !error && (
        <MarketplaceEmptyState />
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
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Click "Apply to Session" to express your interest.
            The enterprise will review your application and notify you of the outcome.
          </p>
        </div>
      )}
    </div>
  );
}
