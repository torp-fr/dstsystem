import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanningDashboard } from '@/components/planning';
import SessionsOperationalView from '@/components/session/SessionsOperationalView';
import SessionDetailModal from '@/components/session/SessionDetailModal';
import CalendarPage from './CalendarPage';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Calendar, Plus, Table } from 'lucide-react';

/**
 * SessionsPage — Unified Sessions Management
 *
 * Combines Operational (table), Planning (grid), and Calendar views
 * with toggle switch for seamless view switching.
 * Modal-based session detail replaces route-based navigation.
 *
 * PURE UI LAYER - no business logic modifications.
 */

type ViewMode = 'operational' | 'grid' | 'calendar';

interface SelectedSession {
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
  acceptedOperators?: any[];
  pendingOperators?: any[];
  rejectedOperators?: any[];
}

export default function SessionsPage() {
  const [view, setView] = useState<ViewMode>('operational');
  const [selectedSession, setSelectedSession] = useState<SelectedSession | null>(null);
  const navigate = useNavigate();

  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
  };

  const handleAssignClick = (sessionId: string) => {
    // Navigate to edit with assign mode
    navigate(`/dashboard/sessions/${sessionId}/edit?action=assign`);
  };

  const handleEditClick = (sessionId: string) => {
    navigate(`/dashboard/sessions/${sessionId}/edit`);
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Page Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Planifier, suivre et ajuster les sessions en cours
          </p>
        </div>

        {/* Actions and View Toggle */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/dashboard/sessions/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle session
          </Button>

          {/* View Toggle - Operational vs Grid vs Calendar */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={view === 'operational' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('operational')}
              className="gap-2"
              title="Tableau opérationnel"
            >
              <Table className="h-4 w-4" />
              Tableau
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="gap-2"
              title="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
              Grille
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="gap-2"
              title="Vue calendrier"
            >
              <Calendar className="h-4 w-4" />
              Calendrier
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View Info Banner */}
      {view === 'calendar' && (
        <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
          Visualisez la charge des sessions dans le temps
        </div>
      )}

      {/* View Content */}
      <div className="flex-1 overflow-auto">
        {view === 'operational' ? (
          <SessionsOperationalView
            onSessionClick={handleSessionClick}
            onAssignClick={handleAssignClick}
            onEditClick={handleEditClick}
          />
        ) : view === 'grid' ? (
          <PlanningDashboard onSessionClick={handleSessionClick} />
        ) : (
          <CalendarPage onSessionClick={handleSessionClick} />
        )}
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={selectedSession !== null}
        onClose={handleCloseModal}
        onEdit={handleEditClick}
        onAssign={handleAssignClick}
      />
    </div>
  );
}
