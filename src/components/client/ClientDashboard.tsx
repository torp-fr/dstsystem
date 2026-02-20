import React, { useEffect, useState } from 'react';
import ClientSessionCard from './ClientSessionCard';
import ClientCreateSessionForm from './ClientCreateSessionForm';
import ClientEmptyState from './ClientEmptyState';

/**
 * ClientDashboard — Client Portal Interface
 *
 * PURE UI LAYER:
 * - Reads ONLY from Domain.PlanningStateService.getClientPlanning()
 * - Displays client's own sessions
 * - Shows create session form
 * - NO business logic, NO automation
 */

interface ClientSession {
  sessionId: string;
  date: string;
  status: string;
  operatorCount: number;
  minRequired: number;
  isOperational: boolean;
  pendingApplications: number;
  marketplaceVisible: boolean;
}

interface ClientDashboardProps {
  clientId: string;
}

export default function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ============================================================
  // FETCH CLIENT SESSIONS ON MOUNT
  // ============================================================

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const result = (window as any).Domain?.PlanningStateService?.getClientPlanning(clientId);

      if (!result) {
        setError('Service not initialized');
        setSessions([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSessions(result.sessions || []);
      } else {
        setError(result.error || 'Failed to load sessions');
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [clientId, refreshTrigger]);

  // ============================================================
  // HANDLE SESSION CREATION
  // ============================================================

  const handleSessionCreated = () => {
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes Sessions</h1>
          <p className="text-gray-600 mt-1">
            Gérer vos programmes et suivre le staffing
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium"
        >
          {showForm ? 'Annuler' : 'Nouveau Programme'}
        </button>
      </div>

      {/* CREATE SESSION FORM */}
      {showForm && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <ClientCreateSessionForm
            clientId={clientId}
            onSuccess={handleSessionCreated}
          />
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading your sessions...
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && sessions.length === 0 && !error && (
        <ClientEmptyState />
      )}

      {/* SESSIONS GRID */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(session => (
            <ClientSessionCard key={session.sessionId} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
