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
          style: 'bg-yellow-100 text-yellow-700',
          icon: Clock,
          label: 'Pending'
        };
      case 'accepted':
        return {
          style: 'bg-green-100 text-green-700',
          icon: CheckCircle,
          label: 'Accepted'
        };
      case 'rejected':
        return {
          style: 'bg-red-100 text-red-700',
          icon: XCircle,
          label: 'Rejected'
        };
      default:
        return {
          style: 'bg-gray-100 text-gray-700',
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
