'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getServiceOrder, updateServiceOrder, deleteServiceOrder } from '@/lib/api';
import { ServiceOrder } from '@/lib/types';
import { formatDate, formatDateTime, isOrderOverdue, getDaysUntilDeadline } from '@/lib/utils';
import { 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  const handleStatusChange = async (newStatus: 'open' | 'closed' | 'unresolved') => {
    if (!order) return;

    try {
      setUpdating(true);
      
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'closed') {
        updateData.completion_date = new Date().toISOString().split('T')[0];
      }

      const updatedOrder = await updateServiceOrder(order.id, updateData);
      setOrder(updatedOrder);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Erro ao atualizar status da ordem');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      return;
    }

    try {
      await deleteServiceOrder(order.id);
      router.push('/orders');
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Erro ao excluir ordem de serviço');
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
          <PageHeader title="Detalhes da Ordem" />
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
              <Link href="/orders" className="mt-4 text-slate-600 underline">
                Voltar para listagem
              </Link>
            </div>
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  const overdue = isOrderOverdue(order);
  const daysUntilDeadline = getDaysUntilDeadline(order.predicted_date);

  return (
    <ProtectedRoute>
      <Sidebar>
        <PageHeader 
          title={`Ordem #${order.id}`}
          description={order.title}
        >
          <div className="flex items-center space-x-3">
            <Link href={`/orders/${order.id}/edit`}>
              <Button variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleDelete}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </PageHeader>

        <div className="p-6 space-y-6">
          {/* Status e ações rápidas */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <StatusBadge status={order.status} />
                <PriorityBadge priority={order.priority} />
                {overdue && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    Em atraso
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {order.status === 'open' && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStatusChange('closed')}
                      loading={updating}
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleStatusChange('unresolved')}
                      loading={updating}
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Marcar como Não Resolvida
                    </Button>
                  </>
                )}
                
                {order.status !== 'open' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('open')}
                    loading={updating}
                  >
                    Reabrir
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações principais */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descrição */}
              <Card>
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-slate-400 mr-2" />
                  <h3 className="text-lg font-medium text-slate-900">Descrição</h3>
                </div>
                <p className="text-slate-600 whitespace-pre-wrap">{order.description}</p>
              </Card>

              {/* Resolução (se houver) */}
              {order.resolved && (
                <Card>
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="text-lg font-medium text-slate-900">Resolução</h3>
                  </div>
                  <p className="text-slate-600 whitespace-pre-wrap">{order.resolved}</p>
                </Card>
              )}
            </div>

            {/* Informações laterais */}
            <div className="space-y-6">
              {/* Datas */}
              <Card>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Cronograma</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Início</p>
                      <p className="text-sm text-slate-600">{formatDate(order.start_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Prazo</p>
                      <p className={`text-sm ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                        {formatDate(order.predicted_date)}
                        {order.status !== 'closed' && (
                          <span className="block text-xs">
                            {daysUntilDeadline > 0 
                              ? `${daysUntilDeadline} dias restantes`
                              : `${Math.abs(daysUntilDeadline)} dias de atraso`
                            }
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {order.completion_date && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Conclusão</p>
                        <p className="text-sm text-slate-600">{formatDate(order.completion_date)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Pessoas */}
              <Card>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Pessoas</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Solicitante</p>
                      <p className="text-sm text-slate-600">Usuário #{order.from_user}</p>
                    </div>
                  </div>
                  
                  {order.responsible && (
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-slate-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Responsável</p>
                        <p className="text-sm text-slate-600">Usuário #{order.responsible}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Avaliação */}
              {order.rate && (
                <Card>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Avaliação</h3>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < order.rate! ? 'text-yellow-400' : 'text-slate-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-slate-600">
                      {order.rate}/5
                    </span>
                  </div>
                </Card>
              )}

              {/* Metadados */}
              <Card>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Informações</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Criado em:</span>
                    <span className="ml-2 text-slate-900">{formatDateTime(order.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Atualizado em:</span>
                    <span className="ml-2 text-slate-900">{formatDateTime(order.updated_at)}</span>
                  </div>
                  {order.days_delay > 0 && (
                    <div>
                      <span className="text-slate-500">Dias de atraso:</span>
                      <span className="ml-2 text-red-600 font-medium">{order.days_delay}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}