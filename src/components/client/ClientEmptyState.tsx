import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * ClientEmptyState — No Sessions Yet
 */

export default function ClientEmptyState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Aucune session programmée
        </h3>
        <p className="text-gray-500 max-w-md">
          Créez votre premier programme pour démarrer. Cliquez sur "Nouveau Programme" pour soumettre une demande.
        </p>
      </div>
    </div>
  );
}
