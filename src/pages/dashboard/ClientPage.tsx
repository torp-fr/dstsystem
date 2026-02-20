import React from 'react';
import { ClientDashboard } from '@/components/client';
import { useAuth } from '@/context/AuthContext';

/**
 * ClientPage — Client Portal Container
 *
 * Wraps ClientDashboard within dashboard layout.
 * PURE UI LAYER - no business logic.
 */

export default function ClientPage() {
  const { user } = useAuth();

  // Get client ID from user
  const clientId = user?.user_metadata?.client_id || user?.id || '';

  if (!clientId) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="text-center py-12">
          <p className="text-red-600">Client ID not found. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Portail Client</h1>
        <p className="text-gray-600 mt-1">
          Gérer vos programmes de formation au tir
        </p>
      </div>

      {/* CLIENT DASHBOARD */}
      <ClientDashboard clientId={clientId} />
    </div>
  );
}
