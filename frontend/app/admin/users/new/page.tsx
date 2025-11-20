'use client';

import UserForm from '@/components/admin/UserForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import PageHeader from '@/components/ui/PageHeader';

export default function UserCreatePage() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="flex flex-col h-full">
          <PageHeader 
            title="Cadastrar Novo Usuário" 
            description="Crie uma nova conta de usuário com as permissões apropriadas"
          />
          <main className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
              <UserForm />
            </div>
          </main>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}

