import React, { useState } from 'react';
import { PlanningDashboard } from '@/components/planning';
import CalendarPage from './CalendarPage';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Calendar } from 'lucide-react';

/**
 * SessionsPage — Unified Sessions Management
 *
 * Combines Planning (grid view) and Calendar views in a single page
 * with toggle switch for seamless view switching.
 *
 * PURE UI LAYER - no business logic modifications.
 */

type ViewMode = 'grid' | 'calendar';

export default function SessionsPage() {
  const [view, setView] = useState<ViewMode>('grid');

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

        {/* View Toggle - Grid vs Calendar */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('grid')}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Vue Opérationnelle
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('calendar')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Vue Calendrier
          </Button>
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
        {view === 'grid' ? (
          <PlanningDashboard />
        ) : (
          <CalendarPage />
        )}
      </div>
    </div>
  );
}
