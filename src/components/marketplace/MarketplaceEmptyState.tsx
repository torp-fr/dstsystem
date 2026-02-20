import React from 'react';
import { CalendarX } from 'lucide-react';

/**
 * MarketplaceEmptyState — No Sessions Available
 *
 * Shows when there are no marketplace sessions
 */

export default function MarketplaceEmptyState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <CalendarX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Aucune session disponible actuellement
        </h3>
        <p className="text-gray-500 max-w-md">
          Revenez plus tard ou contactez l'entreprise pour découvrir les nouvelles opportunités.
        </p>
      </div>
    </div>
  );
}
