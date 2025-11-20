'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentOrders from '@/components/dashboard/RecentOrders';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import ChatWidget from '@/components/chat/ChatWidget';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getServiceOrders, getDashboardStats } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';
import { ServiceOrder } from '@/lib/types';

interface DashboardData {
  orders: ServiceOrder[];
  stats: {
    total_orders: number;
    open_orders: number;
    closed_orders: number;
    overdue_orders: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo
      const [ordersResponse, stats] = await Promise.all([
        getServiceOrders({ page_size: 10 }),
        getDashboardStats(),
      ]);

      setData({
        orders: ordersResponse.results,
        stats,
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <PageHeader 
            title="Dashboard" 
            description="Visão geral das ordens de serviço"
          />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
              <button 
                onClick={loadDashboardData}
                className="ml-4 text-red-800 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Sidebar>
        <PageHeader 
          title="Dashboard" 
          description="Visão geral das ordens de serviço"
        >
        </PageHeader>

        <div className="p-6 space-y-6">
          {/* Cards de estatísticas */}
          {data && (
            <StatsCards
              totalOrders={data.stats.total_orders}
              openOrders={data.stats.open_orders}
              closedOrders={data.stats.closed_orders}
              overdue={data.stats.overdue_orders}
            />
          )}

          {/* Gráficos do dashboard */}
          <ScrollReveal>
            {data && <DashboardCharts orders={data.orders} />}
          </ScrollReveal>

          {/* Ordens recentes */}
          <ScrollReveal>
            {data && <RecentOrders orders={data.orders} />}
          </ScrollReveal>           
        </div>

        {/* Chat Widget */}
        <ChatWidget />
      </Sidebar>
    </ProtectedRoute>
  );
}