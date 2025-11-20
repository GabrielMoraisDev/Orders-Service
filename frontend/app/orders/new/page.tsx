'use client';

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import ServiceOrderForm from '@/components/orders/ServiceOrderForm';
import { createServiceOrder } from '@/lib/api';
import { ServiceOrderFormData } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ServiceOrderFormData) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      await createServiceOrder({
        ...formData,
        from_user: user.id,
        status: 'open',
      });

      router.push('/orders');
      router.refresh();
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Erro ao criar ordem de serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Sidebar>
        <PageHeader 
          title="Nova Ordem de Serviço" 
          description="Crie uma nova ordem de serviço"
        />
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <Card>
            <ServiceOrderForm
              onSubmit={handleSubmit}
              loading={loading}
              submitText="Criar Ordem"
            />
          </Card>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}