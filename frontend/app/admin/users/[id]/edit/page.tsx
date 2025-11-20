'use client';

import { useRouter, useParams } from 'next/navigation';
import UserForm from '@/components/admin/UserForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string, 10);

  const handleSuccess = () => {
    router.push('/admin/users');
  };

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="flex flex-col h-full">
          <PageHeader 
            title="Editar Usuário" 
            description="Atualize os dados e permissões do usuário"
          />
          <main className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
              <UserForm userId={userId} onSuccess={handleSuccess} />
            </div>
          </main>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
