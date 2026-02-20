import React from 'react';
import { MarketplaceDashboard } from '@/components/marketplace';

/**
 * MarketplacePage — Operator Marketplace Container
 *
 * Wraps MarketplaceDashboard within the dashboard layout.
 * PURE READ-ONLY/ACTION LAYER - no business logic.
 */

export default function MarketplacePage() {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Page Container */}
      <MarketplaceDashboard />
    </div>
  );
}
