import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

/**
 * MarketplaceApplicationBadge — Application Status Display
 *
 * Shows operator's application status for a session
 */

interface MarketplaceApplicationBadgeProps {
  status: 'pending' | 'accepted' | 'rejected';
}

export default function MarketplaceApplicationBadge({
  status
}: MarketplaceApplicationBadgeProps) {
  // ============================================================
  // STATUS STYLES & LABELS
  // ============================================================

  const getConfig = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return {
          style: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
          icon: Clock,
          label: 'Application Pending',
          subtext: 'Awaiting enterprise review'
        };
      case 'accepted':
        return {
          style: 'bg-green-100 text-green-700 border border-green-200',
          icon: CheckCircle,
          label: 'Accepted',
          subtext: 'You are assigned to this session'
        };
      case 'rejected':
        return {
          style: 'bg-red-100 text-red-700 border border-red-200',
          icon: XCircle,
          label: 'Rejected',
          subtext: 'Not selected for this session'
        };
      default:
        return {
          style: 'bg-gray-100 text-gray-700 border border-gray-200',
          icon: Clock,
          label: 'Unknown',
          subtext: 'Status unknown'
        };
    }
  };

  const config = getConfig(status);
  const Icon = config.icon;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={`rounded-lg p-3 flex items-center gap-2 ${config.style}`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium text-sm">{config.label}</div>
        <div className="text-xs opacity-75">{config.subtext}</div>
      </div>
    </div>
  );
}
