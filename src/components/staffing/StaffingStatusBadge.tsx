import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * StaffingStatusBadge — Application Status Display
 *
 * Shows operator application status with icon
 */

interface StaffingStatusBadgeProps {
  status: 'pending' | 'accepted' | 'rejected';
}

export default function StaffingStatusBadge({ status }: StaffingStatusBadgeProps) {
  // ============================================================
  // STATUS CONFIG
  // ============================================================

  const getConfig = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return {
          style: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
          icon: Clock,
          label: 'À valider'
        };
      case 'accepted':
        return {
          style: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle,
          label: 'Confirmé'
        };
      case 'rejected':
        return {
          style: 'bg-destructive/10 text-destructive border border-destructive/20',
          icon: XCircle,
          label: 'Refusé'
        };
      default:
        return {
          style: 'bg-muted text-muted-foreground',
          icon: Clock,
          label: 'Unknown'
        };
    }
  };

  const config = getConfig(status);
  const Icon = config.icon;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={`rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 ${config.style}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}
