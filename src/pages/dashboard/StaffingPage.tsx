import React from 'react';
import { StaffingBoardDashboard } from '@/components/staffing';

/**
 * StaffingPage — Enterprise Staffing Management Container
 *
 * Wraps StaffingBoardDashboard within the dashboard layout.
 * PURE UI LAYER - no business logic.
 */

export default function StaffingPage() {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Page Container */}
      <StaffingBoardDashboard />
    </div>
  );
}
