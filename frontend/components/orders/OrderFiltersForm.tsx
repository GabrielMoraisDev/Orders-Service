'use client';

import { useState } from 'react';
import { OrderFilters } from '@/lib/types';
import { PRIORITY_MAP, STATUS_MAP } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OrderFiltersFormProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  onClear: () => void;
}

export default function OrderFiltersForm({ filters, onFiltersChange, onClear }: OrderFiltersFormProps) {
  const [localFilters, setLocalFilters] = useState<OrderFilters>(filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange(localFilters);
  };

  const handleChange = (key: keyof OrderFilters, value: string | number | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca por texto */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Título ou descrição..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>

        {/* Filtro por status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Filtro por prioridade */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prioridade
          </label>
          <select
            value={localFilters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          >
            <option value="">Todas</option>
            {Object.entries(PRIORITY_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Data de início - De */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Data início - De
          </label>
          <input
            type="date"
            value={localFilters.start_date_from || ''}
            onChange={(e) => handleChange('start_date_from', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>

        {/* Data de início - Até */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Data início - Até
          </label>
          <input
            type="date"
            value={localFilters.start_date_to || ''}
            onChange={(e) => handleChange('start_date_to', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center space-x-3">
        <Button type="submit" size="sm">
          <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleClear}
        >
          <XMarkIcon className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>
    </form>
  );
}