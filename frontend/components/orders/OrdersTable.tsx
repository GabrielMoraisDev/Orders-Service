import { ServiceOrder } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate, isOrderOverdue, truncateText } from '@/lib/utils';
import { 
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface OrdersTableProps {
  orders: ServiceOrder[];
  loading?: boolean;
}

export default function OrdersTable({ orders = [], loading = false }: OrdersTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Carregando ordens...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-8 text-center">
          <ClockIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">Nenhuma ordem encontrada</p>
          <p className="text-slate-400">Tente ajustar os filtros ou criar uma nova ordem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ordem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Data Início
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Prazo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {orders.map((order) => {
              const overdue = isOrderOverdue(order);
              
              return (
                <tr 
                  key={order.id} 
                  className={`hover:bg-slate-50 cursor-pointer ${overdue ? 'bg-red-50' : ''}`}
                  onClick={() => window.location.href = `/orders/${order.id}/edit`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-slate-900">
                            {truncateText(order.title, 40)}
                          </div>
                          {overdue && (
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-slate-500">
                          #{order.id} • {truncateText(order.description, 60)}
                        </div>
                        {order.days_delay > 0 && (
                          <div className="text-xs text-red-600 font-medium mt-1">
                            {order.days_delay} dia{order.days_delay > 1 ? 's' : ''} de atraso
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={order.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatDate(order.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {formatDate(order.predicted_date)}
                    </div>
                    {overdue && (
                      <div className="text-xs text-red-600 font-medium">
                        Em atraso
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}