'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ExclamationCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { UserData } from '@/lib/api';

export default function UsersPage() {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error('Erro ao buscar usuários');
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken]);

  const handleDelete = async (userId: number) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('Erro ao desativar usuário');
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao desativar usuário');
    }
  };

  if (!user?.is_staff) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <div className="flex flex-col h-full">
            <PageHeader 
              title="Usuários" 
              description="Gerenciar usuários do sistema"
            />
            <main className="flex-1 overflow-auto bg-slate-50 p-6">
              <Card className="bg-yellow-50 border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
                  <p className="text-sm text-yellow-800">Acesso restrito aos administradores.</p>
                </div>
              </Card>
            </main>
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="flex flex-col h-full">
          <PageHeader 
            title="Gerenciar Usuários" 
            description="Visualize, edite ou crie novos usuários do sistema"
          />
          <main className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Ações */}
              <div className="mb-6 flex gap-3">
                <Link href="/admin/users/new">
                  <Button>+ Novo Usuário</Button>
                </Link>
              </div>

              {/* Conteúdo */}
              {error && (
                <Card className="bg-red-50 border border-red-200 mb-6">
                  <div className="flex items-center space-x-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </Card>
              )}

              {loading ? (
                <Card className="bg-white">
                  <p className="text-slate-600">Carregando usuários...</p>
                </Card>
              ) : users.length === 0 ? (
                <Card className="bg-white">
                  <p className="text-slate-600">Nenhum usuário encontrado.</p>
                </Card>
              ) : (
                <Card className="bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Usuário</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nome</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Permissões</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {users.map((userData) => (
                          <tr key={userData.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-900">{userData.username}</td>
                            <td className="px-6 py-4 text-sm text-slate-900">
                              {userData.first_name} {userData.last_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{userData.email}</td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex gap-1 flex-wrap">
                                {userData.is_superuser && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Superusuário</span>
                                )}
                                {userData.is_staff && !userData.is_superuser && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Staff</span>
                                )}
                                {!userData.is_staff && !userData.is_superuser && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded">Usuário</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/users/${userData.id}/edit`}>
                                  <button className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors" title="Editar">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => userData.id && handleDelete(userData.id)}
                                  className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                                  title="Desativar"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </main>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
