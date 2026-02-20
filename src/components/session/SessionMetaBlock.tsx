import React from 'react';

/**
 * SessionMetaBlock — Session Metadata Display
 *
 * Displays:
 * - Client ID
 * - Session ID
 * - Notes
 * - Setup IDs
 */

interface SessionMetaBlockProps {
  sessionId: string;
  clientId: string;
  notes?: string;
  setupIds?: string[];
}

export default function SessionMetaBlock({
  sessionId,
  clientId,
  notes,
  setupIds = []
}: SessionMetaBlockProps) {
  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Informations
      </h2>

      <div className="space-y-4">
        {/* Client ID */}
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-sm text-gray-600">Client ID</span>
          <span className="text-sm font-semibold text-gray-800 font-mono">
            {clientId}
          </span>
        </div>

        {/* Session ID */}
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-sm text-gray-600">Session ID</span>
          <span className="text-sm font-semibold text-gray-800 font-mono">
            {sessionId}
          </span>
        </div>

        {/* Setup IDs */}
        {setupIds.length > 0 && (
          <div className="py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Setups</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {setupIds.map((setupId, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {setupId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="py-3">
            <span className="text-sm text-gray-600 block mb-2">Notes</span>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
