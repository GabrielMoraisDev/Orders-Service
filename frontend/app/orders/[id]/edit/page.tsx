'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ServiceOrderForm from '@/components/orders/ServiceOrderForm';
import { getServiceOrder, updateServiceOrder } from '@/lib/api';
import { ServiceOrder, ServiceOrderFormData } from '@/lib/types';
import { dateToInputFormat } from '@/lib/utils';

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string);
  
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await getServiceOrder(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Erro ao carregar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ServiceOrderFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      await updateServiceOrder(orderId, {
        ...formData,
        // Manter campos que não estão no formulário
        from_user: order!.from_user,
      });

      router.push('/orders');
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Erro ao atualizar ordem de serviço. Tente novamente.');
    } finally {
      setSubmitting(false);
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

  if (error && !order) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <PageHeader title="Editar Ordem de Serviço" />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
              <button 
                onClick={loadOrder}
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

  if (!order) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <PageHeader title="Ordem não encontrada" />
          <div className="p-6">
            <div className="text-center">
              <p className="text-slate-500">A ordem de serviço solicitada não foi encontrada.</p>
              <button 
                onClick={() => router.push('/orders')}
                className="mt-4 text-slate-600 underline"
              >
                Voltar para listagem
              </button>
            </div>
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  const initialData: ServiceOrderFormData = {
    title: order.title,
    description: order.description,
    start_date: dateToInputFormat(order.start_date),
    predicted_date: dateToInputFormat(order.predicted_date),
    priority: order.priority,
    responsible: order.responsible || undefined,
  };

  return (
    <ProtectedRoute>
      <Sidebar>
        <PageHeader 
          title="Editar Ordem de Serviço" 
          description={`Editando ordem #${order.id}: ${order.title}`}
        />
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <Card>
            <ServiceOrderForm
              initialData={initialData}
              onSubmit={handleSubmit}
              loading={submitting}
              submitText="Salvar Alterações"
            />
          </Card>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}