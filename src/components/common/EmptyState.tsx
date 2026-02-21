import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * EmptyState — Unified empty state component for consistent UI
 *
 * Displays a centered message when no data is available.
 * Props:
 * - icon: LucideIcon to display
 * - title: Main message
 * - description: Subtitle/details
 */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <Icon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
