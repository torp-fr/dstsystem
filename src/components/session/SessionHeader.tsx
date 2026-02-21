import React from 'react';

/**
 * SessionHeader — Session Date & Status Badges
 *
 * Displays:
 * - Session date (bold)
 * - Region
 * - Status badge (gray/blue/red)
 * - Marketplace badge (purple if visible)
 */

interface SessionHeaderProps {
  date: string;
  status: string;
  marketplaceVisible: boolean;
}

export default function SessionHeader({
  date,
  status,
  marketplaceVisible
}: SessionHeaderProps) {
  // ============================================================
  // STATUS BADGE COLORS
  // ============================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return 'bg-gray-100 text-gray-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {formattedDate}
        </h1>
        <p className="text-muted-foreground mt-1">
          Détails et gestion de la session
        </p>
      </div>

      <div className="flex flex-col gap-2 items-end">
        {/* Status Badge */}
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>

        {/* Marketplace Badge */}
        {marketplaceVisible && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-600/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            Marketplace
          </span>
        )}
      </div>
    </div>
  );
}
