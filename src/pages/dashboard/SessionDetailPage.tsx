import React from 'react';
import { SessionDetailPage } from '@/components/session';

/**
 * SessionPage — Session Detail Container
 *
 * Wraps SessionDetailPage within the dashboard layout.
 * Route: /dashboard/session/:sessionId
 *
 * PURE UI LAYER - no business logic.
 * All data flows through Domain.PlanningStateService
 */

export default function SessionDetailPageWrapper() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* SESSION DETAIL */}
      <SessionDetailPage />
    </div>
  );
}
