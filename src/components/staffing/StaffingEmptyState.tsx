import React from 'react';
import { Users } from 'lucide-react';

/**
 * StaffingEmptyState — No Sessions Needing Staffing
 *
 * Shows when all sessions are operational or no sessions available
 */

export default function StaffingEmptyState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Aucune session en attente de staffing
        </h3>
        <p className="text-muted-foreground max-w-md">
          Toutes les sessions marketplace actuelles sont opérationnelles ou complètement staffées.
        </p>
      </div>
    </div>
  );
}
