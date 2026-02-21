import React, { useState } from 'react';

/**
 * PlanningFilters — Filter Controls for Planning Dashboard
 *
 * PURE UI LAYER:
 * - Filter inputs only (NO API calls)
 * - Emits filter changes to parent
 * - NO debounce, NO logic
 */

interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  region?: string;
  status?: string;
}

interface PlanningFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export default function PlanningFilters({ onFiltersChange }: PlanningFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});

  // ============================================================
  // FILTER OPTIONS
  // ============================================================

  const REGIONS = [
    { value: '', label: 'Toutes les régions' },
    { value: 'occitanie', label: 'Occitanie' },
    { value: 'paca', label: 'PACA' },
    { value: 'idf', label: 'Île-de-France' },
    { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' }
  ];

  const STATUS_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending_confirmation', label: 'En validation' },
    { value: 'confirmed', label: 'Confirmé' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  // ============================================================
  // FILTER HANDLERS
  // ============================================================

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      dateFrom: e.target.value || undefined
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      dateTo: e.target.value || undefined
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = {
      ...filters,
      region: e.target.value || undefined
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = {
      ...filters,
      status: e.target.value || undefined
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        Filtres
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Date From */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Du
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={handleDateFromChange}
            className="px-3 py-2 bg-card text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Au
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={handleDateToChange}
            className="px-3 py-2 bg-card text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Région
          </label>
          <select
            value={filters.region || ''}
            onChange={handleRegionChange}
            className="px-3 py-2 bg-card text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {REGIONS.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Statut
          </label>
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="px-3 py-2 bg-card text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
