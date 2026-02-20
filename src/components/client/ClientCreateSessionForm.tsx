import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * ClientCreateSessionForm — Create New Session
 *
 * Simple form for clients to request a new session
 * NO complex validation, NO intelligence
 * Just UI → BookingFlowController.createSessionRequest()
 */

interface ClientCreateSessionFormProps {
  clientId: string;
  onSuccess: () => void;
}

export default function ClientCreateSessionForm({
  clientId,
  onSuccess
}: ClientCreateSessionFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    setupIds: '',
    minOperators: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================================
  // HANDLE FORM CHANGE
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minOperators' ? parseInt(value) || 1 : value
    }));
    setError(null);
  };

  // ============================================================
  // HANDLE SUBMIT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.date || !formData.setupIds) {
        setError('Date and setups are required');
        setLoading(false);
        return;
      }

      // Parse setupIds (simple comma-separated)
      const setupIds = formData.setupIds
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      if (setupIds.length === 0) {
        setError('At least one setup is required');
        setLoading(false);
        return;
      }

      // Call BookingFlowController
      const result = (window as any).BookingFlowController?.createSessionRequest({
        clientId,
        date: formData.date,
        setupIds,
        operatorRequirement: {
          minOperators: formData.minOperators,
          preferredOperators: formData.minOperators
        },
        notes: formData.notes
      });

      if (result && result.success) {
        setSuccess(true);
        setFormData({
          date: '',
          setupIds: '',
          minOperators: 1,
          notes: ''
        });

        // Call success callback after delay
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(result?.error || 'Failed to create session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-700 font-semibold mb-2">
          ✓ Session créée avec succès!
        </div>
        <p className="text-sm text-gray-600">
          Votre demande a été envoyée. L'entreprise examinera et confirmera la session.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Créer un Nouveau Programme
      </h3>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 border border-red-300 rounded p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* DATE */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* SETUPS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Setups (séparés par virgule) *
        </label>
        <input
          type="text"
          name="setupIds"
          placeholder="setup_1, setup_2, setup_3"
          value={formData.setupIds}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-gray-500 mt-1">
          Entrez les IDs de setup séparés par des virgules
        </p>
      </div>

      {/* MIN OPERATORS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opérateurs Requis *
        </label>
        <select
          name="minOperators"
          value={formData.minOperators}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="1">1 opérateur</option>
          <option value="2">2 opérateurs</option>
          <option value="3">3 opérateurs</option>
          <option value="4">4 opérateurs</option>
          <option value="5">5 opérateurs</option>
        </select>
      </div>

      {/* NOTES */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optionnel)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Informations supplémentaires sur votre demande..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* SUBMIT */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white hover:bg-primary/90"
        >
          {loading ? 'Création...' : 'Créer la Demande'}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        💡 Votre demande sera examinée par l'entreprise avant d'être publiée sur le marché.
      </p>
    </form>
  );
}
