import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react';

/**
 * StatusBadge — Unified status badge component
 *
 * Centralizes status styling and icons for:
 * - Session statuses: pending_confirmation, confirmed, cancelled
 * - Staffing statuses: pending, accepted, rejected
 */

interface StatusBadgeProps {
  status: string;
  type?: 'session' | 'staffing' | 'auto';
  size?: 'sm' | 'md';
}

export default function StatusBadge({
  status,
  type = 'auto',
  size = 'md'
}: StatusBadgeProps) {
  // ============================================================
  // STATUS CONFIG
  // ============================================================

  const sessionStatusConfig: Record<string, any> = {
    pending_confirmation: {
      style: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
      icon: Clock,
      label: 'En validation'
    },
    confirmed: {
      style: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
      label: 'Confirmé'
    },
    cancelled: {
      style: 'bg-destructive/10 text-destructive border border-destructive/20',
      icon: XCircle,
      label: 'Annulé'
    }
  };

  const staffingStatusConfig: Record<string, any> = {
    pending: {
      style: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
      icon: Clock,
      label: 'À valider'
    },
    accepted: {
      style: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
      label: 'Confirmé'
    },
    rejected: {
      style: 'bg-destructive/10 text-destructive border border-destructive/20',
      icon: XCircle,
      label: 'Refusé'
    }
  };

  // ============================================================
  // DETECT TYPE AND GET CONFIG
  // ============================================================

  const getConfig = () => {
    // Auto-detect if type is 'auto'
    if (type === 'auto') {
      if (status in sessionStatusConfig) {
        return sessionStatusConfig[status];
      } else if (status in staffingStatusConfig) {
        return staffingStatusConfig[status];
      }
    }

    // Use specified type
    if (type === 'session' && status in sessionStatusConfig) {
      return sessionStatusConfig[status];
    }
    if (type === 'staffing' && status in staffingStatusConfig) {
      return staffingStatusConfig[status];
    }

    // Default fallback
    return {
      style: 'bg-muted text-muted-foreground border border-border',
      icon: AlertCircle,
      label: status
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-2 text-sm';

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={`rounded-full ${sizeClasses} font-medium flex items-center gap-1.5 ${config.style}`}>
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </div>
  );
}
