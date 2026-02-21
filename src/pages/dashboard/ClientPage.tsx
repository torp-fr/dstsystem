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
          <p className="text-destructive">ID client non trouvé. Veuillez contacter le support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* CLIENT DASHBOARD */}
      <ClientDashboard clientId={clientId} />
    </div>
  );
}
