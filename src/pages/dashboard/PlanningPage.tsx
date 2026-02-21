import React from 'react';
import { PlanningDashboard } from '@/components/planning';

/**
 * Planning Page — Planning Dashboard Container
 *
 * Wraps PlanningDashboard within the dashboard layout.
 * PURE READ-ONLY LAYER - no business logic.
 */

export default function PlanningPage() {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Visualiser et gérer le planning des sessions
          </p>
        </div>
      </div>

      {/* Planning Dashboard */}
      <PlanningDashboard />
    </div>
  );
}
