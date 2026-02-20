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
      style: 'bg-gray-100 text-gray-700',
      icon: Clock,
      label: 'Pending Confirmation'
    },
    confirmed: {
      style: 'bg-blue-100 text-blue-700',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    cancelled: {
      style: 'bg-red-100 text-red-700',
      icon: XCircle,
      label: 'Cancelled'
    }
  };

  const staffingStatusConfig: Record<string, any> = {
    pending: {
      style: 'bg-yellow-100 text-yellow-700',
      icon: Clock,
      label: 'Pending'
    },
    accepted: {
      style: 'bg-green-100 text-green-700',
      icon: CheckCircle,
      label: 'Accepted'
    },
    rejected: {
      style: 'bg-red-100 text-red-700',
      icon: XCircle,
      label: 'Rejected'
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
      style: 'bg-gray-100 text-gray-700',
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
