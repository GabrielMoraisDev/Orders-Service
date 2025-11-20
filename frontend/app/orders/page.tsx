'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import OrderFiltersForm from '@/components/orders/OrderFiltersForm';
import OrdersTable from '@/components/orders/OrdersTable';
import Pagination from '@/components/ui/Pagination';
import { getServiceOrders } from '@/lib/api';
import { ServiceOrder, OrderFilters } from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/config';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({});

  const loadOrders = useCallback(async (page = 1, currentFilters: OrderFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getServiceOrders({
        ...currentFilters,
        page,
        page_size: DEFAULT_PAGE_SIZE,
      });

      setOrders(response.results);
      setTotalItems(response.count);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Erro ao carregar ordens de serviço');
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(1, filters);
  }, [loadOrders, filters]);

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadOrders(page, filters);
  };

  const totalPages = Math.ceil(totalItems / DEFAULT_PAGE_SIZE);

  return (
    <ProtectedRoute>
      <Sidebar>
        <PageHeader 
          title="Ordens de Serviço" 
          description="Gerencie todas as ordens de serviço"
        >
        </PageHeader>

        <div className="p-6 space-y-6">
          {/* Filtros */}
          <OrderFiltersForm
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
              <button 
                onClick={() => loadOrders(currentPage, filters)}
                className="ml-4 text-red-800 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Tabela */}
          <OrdersTable
            orders={orders}
            loading={loading}
          />

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={DEFAULT_PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}