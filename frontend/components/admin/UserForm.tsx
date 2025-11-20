'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { UserData } from '@/lib/api';

type Group = { id: number; name: string };
type Permission = { id: number; codename: string };

interface UserFormProps {
  userId?: number;
  onSuccess?: () => void;
}

const UserForm = ({ userId, onSuccess }: UserFormProps) => {
  const { user, accessToken } = useAuth();
  const isEditing = !!userId;
  const [form, setForm] = useState<UserData>({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    is_staff: false,
    is_superuser: false,
    groups: [] as number[],
    user_permissions: [] as number[],
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gRes = await fetch('http://localhost:8000/api/users/me/groups/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const pRes = await fetch('http://localhost:8000/api/permissions/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const gData = await gRes.json();
        const pData = await pRes.json();
        setGroups(Array.isArray(gData.groups) ? gData.groups : []);
        setPermissions(Array.isArray(pData.all_permissions) ? pData.all_permissions : []);
      } catch {
        setError('Erro ao buscar grupos/permissões');
      }
    };
    
    // Se está editando, buscar dados do usuário
    const fetchUser = async () => {
      if (isEditing && userId) {
        try {
          const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userData = await response.json();
          setForm({
            username: userData.username,
            password: '',
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            is_staff: userData.is_staff,
            is_superuser: userData.is_superuser,
            is_active: userData.is_active,
            groups: Array.isArray(userData.groups) ? userData.groups : [],
            user_permissions: Array.isArray(userData.user_permissions) ? userData.user_permissions : [],
          });
        } catch {
          setError('Erro ao buscar dados do usuário');
        }
      }
    };
    
    fetchData();
    fetchUser();
  }, [accessToken, isEditing, userId]);

  if (!user?.is_staff) {
    return (
      <Card className="bg-yellow-50 border border-yellow-200">
        <div className="flex items-center space-x-3">
          <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
          <p className="text-sm text-yellow-800">Acesso restrito aos administradores.</p>
        </div>
      </Card>
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMultiSelect = (name: string, values: string[]) => {
    setForm((prev) => ({ ...prev, [name]: values.map(Number) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      let url = 'http://localhost:8000/api/users/create/';
      let method = 'POST';
      
      // Dados a enviar
      const submitData: Record<string, string | number | boolean | number[]> = {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        is_staff: form.is_staff,
        is_superuser: form.is_superuser,
        groups: form.groups || [],
        user_permissions: form.user_permissions || [],
      };
      
      // Se está editando
      if (isEditing) {
        url = `http://localhost:8000/api/users/${userId}/`;
        method = 'PATCH';
        
        // Adicionar senha apenas se foi fornecida
        if (form.password) {
          submitData.password = form.password;
        }
      } else {
        // Para criação, senha é obrigatória
        if (!form.password) {
          setError('Senha é obrigatória para criar novo usuário');
          setLoading(false);
          return;
        }
        submitData.password = form.password;
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(submitData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário`);
      }
      
      setSuccess(true);
      
      // Limpar formulário se criando novo usuário
      if (!isEditing) {
        setForm({
          username: '', 
          password: '', 
          email: '', 
          first_name: '', 
          last_name: '', 
          is_staff: false, 
          is_superuser: false, 
          groups: [], 
          user_permissions: [],
        });
      }
      
      // Chamar callback após sucesso
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na operação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            {isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuário {!isEditing && '*'}
              </label>
              <input 
                name="username" 
                value={form.username} 
                onChange={handleChange} 
                placeholder="Nome de usuário" 
                required={!isEditing}
                disabled={isEditing}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
              </label>
              <input 
                name="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder={isEditing ? 'Deixe em branco para não alterar' : 'Senha'} 
                required={!isEditing}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
              <input 
                name="first_name" 
                value={form.first_name} 
                onChange={handleChange} 
                placeholder="Nome" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Sobrenome</label>
              <input 
                name="last_name" 
                value={form.last_name} 
                onChange={handleChange} 
                placeholder="Sobrenome" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Permissões */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Permissões</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                name="is_staff" 
                checked={form.is_staff} 
                onChange={handleChange}
                className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
              />
              <span className="ml-3 text-sm text-slate-700">Staff (Pode acessar o painel de administração)</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                name="is_superuser" 
                checked={form.is_superuser} 
                onChange={handleChange}
                className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
              />
              <span className="ml-3 text-sm text-slate-700">Superusuário (Acesso total ao sistema)</span>
            </label>
          </div>
        </div>

        {/* Grupos e Permissões Específicas */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Grupos e Permissões</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Grupos</label>
              <select 
                multiple 
                value={form.groups.map(String)} 
                onChange={e => handleMultiSelect('groups', Array.from(e.target.selectedOptions, o => o.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Use Ctrl+Click para selecionar múltiplos grupos</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Permissões Específicas</label>
              <select 
                multiple 
                value={form.user_permissions.map(String)} 
                onChange={e => handleMultiSelect('user_permissions', Array.from(e.target.selectedOptions, o => o.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900"
              >
                {permissions.map((p) => (
                  <option key={p.id} value={p.id}>{p.codename}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Use Ctrl+Click para selecionar múltiplas permissões</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="border-t border-slate-200 pt-6 flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar Usuário' : 'Cadastrar Usuário')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;
