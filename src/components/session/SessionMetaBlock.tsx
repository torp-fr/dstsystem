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
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Informations
      </h2>

      <div className="space-y-4">
        {/* Client ID */}
        <div className="flex justify-between items-center py-3 border-b border-border">
          <span className="text-sm text-muted-foreground">Client</span>
          <span className="text-sm font-semibold text-foreground font-mono">
            {clientId}
          </span>
        </div>

        {/* Session ID */}
        <div className="flex justify-between items-center py-3 border-b border-border">
          <span className="text-sm text-muted-foreground">Identifiant session</span>
          <span className="text-sm font-semibold text-foreground font-mono">
            {sessionId}
          </span>
        </div>

        {/* Setup IDs */}
        {setupIds.length > 0 && (
          <div className="py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Configurations</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {setupIds.map((setupId, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded border border-border"
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
            <span className="text-sm text-muted-foreground block mb-2">Remarques</span>
            <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
