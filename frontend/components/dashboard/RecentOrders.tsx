import Link from 'next/link';
import { useState } from 'react';
import { ServiceOrder } from '@/lib/types';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate, isOrderOverdue } from '@/lib/utils';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface RecentOrdersProps {
  orders: ServiceOrder[];
}

export default function RecentOrders({ orders = [] }: RecentOrdersProps) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sorted = (() => {
    if (!sortBy) return orders;
    const mapPriority = (p: ServiceOrder['priority']) => (p === 'low' ? 1 : p === 'medium' ? 2 : 3);
    const copy = [...orders];
    copy.sort((a, b) => {
      let va: string | number = a[sortBy as keyof ServiceOrder] as string | number;
      let vb: string | number = b[sortBy as keyof ServiceOrder] as string | number;

      if (sortBy === 'title' || sortBy === 'status') {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }

      if (sortBy === 'priority') {
        va = mapPriority(a.priority);
        vb = mapPriority(b.priority);
      }

      if (sortBy === 'predicted_date' || sortBy === 'start_date' || sortBy === 'created_at') {
        va = new Date(va as string).getTime() || 0;
        vb = new Date(vb as string).getTime() || 0;
      }

      if (va < vb) return sortDirection === 'asc' ? -1 : 1;
      if (va > vb) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  })();
  if (orders.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Ordens Recentes</h3>
        <p className="text-slate-500 text-center py-8">Nenhuma ordem encontrada</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">Ordens Recentes</h3>
        <Link 
          href="/orders"
          className="text-sm text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
        >
          Ver todas →
        </Link>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th aria-sort={sortBy === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2"
                >
                  Ordem
                  {sortBy === 'title' && (
                    <span className="text-xs" aria-hidden>
                      {sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-3 w-3" />
                      ) : (
                        <ChevronDownIcon className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </button>
              </th>
              <th aria-sort={sortBy === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2"
                >
                  Status
                  {sortBy === 'status' && (
                    <span className="text-xs" aria-hidden>
                      {sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-3 w-3" />
                      ) : (
                        <ChevronDownIcon className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </button>
              </th>
              <th aria-sort={sortBy === 'priority' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-2"
                >
                  Prioridade
                  {sortBy === 'priority' && (
                    <span className="text-xs" aria-hidden>
                      {sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-3 w-3" />
                      ) : (
                        <ChevronDownIcon className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </button>
              </th>
              <th aria-sort={sortBy === 'predicted_date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('predicted_date')}
                  className="flex items-center gap-2"
                >
                  Prazo
                  {sortBy === 'predicted_date' && (
                    <span className="text-xs" aria-hidden>
                      {sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-3 w-3" />
                      ) : (
                        <ChevronDownIcon className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sorted.slice(0, 5).map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/orders/${order.id}`}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {order.title}
                    </div>
                    <div className="text-sm text-slate-500">
                      #{order.id}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <PriorityBadge priority={order.priority} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {formatDate(order.predicted_date)}
                  </div>
                  {isOrderOverdue(order) && (
                    <div className="text-xs text-red-600 font-medium">
                      Em atraso
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}