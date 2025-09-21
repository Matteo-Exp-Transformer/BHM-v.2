import React from 'react';
import { Check, X } from 'lucide-react';
import type { ConservationPointsFilter } from '@/types/conservation';

interface ConservationFiltersProps {
  filter: ConservationPointsFilter;
  onFilterChange: (filter: Partial<ConservationPointsFilter>) => void;
  totalPoints: number;
}

const typeLabels = {
  fridge: 'Frigoriferi',
  freezer: 'Congelatori',
  blast: 'Abbattitori',
  ambient: 'Ambiente'
};

const statusLabels = {
  normal: 'Normale',
  warning: 'Attenzione',
  critical: 'Critico'
};

const statusColors = {
  normal: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800'
};

export function ConservationFilters({ filter, onFilterChange, totalPoints }: ConservationFiltersProps) {
  const toggleType = (type: keyof typeof typeLabels) => {
    const newTypes = filter.type?.includes(type)
      ? filter.type.filter(t => t !== type)
      : [...(filter.type || []), type];
    onFilterChange({ type: newTypes });
  };

  const toggleStatus = (status: keyof typeof statusLabels) => {
    const newStatuses = filter.status?.includes(status)
      ? filter.status.filter(s => s !== status)
      : [...(filter.status || []), status];
    onFilterChange({ status: newStatuses });
  };

  const clearAllFilters = () => {
    onFilterChange({
      type: undefined,
      status: undefined,
      department_id: undefined,
      has_maintenance_due: undefined
    });
  };

  const hasActiveFilters = filter.type?.length || filter.status?.length || filter.department_id || filter.has_maintenance_due;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Visualizzati {totalPoints} punti di conservazione
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Cancella Filtri
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Type Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tipo Conservazione</h3>
          <div className="space-y-2">
            {Object.entries(typeLabels).map(([type, label]) => {
              const isSelected = filter.type?.includes(type as any) || false;
              const typeIcons: Record<string, string> = {
                fridge: '🧊',
                freezer: '❄️',
                blast: '💨',
                ambient: '🌡️'
              };

              return (
                <button
                  key={type}
                  onClick={() => toggleType(type as keyof typeof typeLabels)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{typeIcons[type]}</span>
                    <span>{label}</span>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Stato Operativo</h3>
          <div className="space-y-2">
            {Object.entries(statusLabels).map(([status, label]) => {
              const isSelected = filter.status?.includes(status as any) || false;
              
              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status as keyof typeof statusLabels)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? `${statusColors[status as keyof typeof statusColors]} border`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Filtri Aggiuntivi</h3>
          <div className="space-y-2">
            <button
              onClick={() => onFilterChange({ has_maintenance_due: !filter.has_maintenance_due })}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                filter.has_maintenance_due
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🔧</span>
                <span>Manutenzione Dovuta</span>
              </div>
              {filter.has_maintenance_due ? (
                <Check className="w-4 h-4 text-orange-600" />
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            {/* Department filter placeholder */}
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border-2 border-dashed border-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-base">📍</span>
                <span>Filtro Dipartimento</span>
              </div>
              <div className="text-xs mt-1">Disponibile quando implementato</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Filtri Attivi:</div>
          <div className="flex flex-wrap gap-2">
            {filter.type?.map(type => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {typeLabels[type as keyof typeof typeLabels]}
                <button
                  onClick={() => toggleType(type as keyof typeof typeLabels)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filter.status?.map(status => (
              <span
                key={status}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                  statusColors[status as keyof typeof statusColors]
                }`}
              >
                {statusLabels[status as keyof typeof statusLabels]}
                <button
                  onClick={() => toggleStatus(status as keyof typeof statusLabels)}
                  className="hover:opacity-75 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filter.has_maintenance_due && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Manutenzione Dovuta
                <button
                  onClick={() => onFilterChange({ has_maintenance_due: false })}
                  className="hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}