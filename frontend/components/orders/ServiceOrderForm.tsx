'use client';

import { useState, useEffect } from 'react';
import { ServiceOrderFormData, User } from '@/lib/types';
import { PRIORITY_MAP } from '@/lib/utils';
import { getAllUsers } from '@/lib/api';
import Button from '@/components/ui/Button';


interface ServiceOrderFormProps {
  initialData?: Partial<ServiceOrderFormData>;
  onSubmit: (data: ServiceOrderFormData) => Promise<void>;
  loading?: boolean;
  submitText?: string;
}

export default function ServiceOrderForm({ 
  initialData, 
  onSubmit, 
  loading = false,
  submitText = 'Salvar'
}: ServiceOrderFormProps) {
  const [formData, setFormData] = useState<ServiceOrderFormData>({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    predicted_date: '',
    priority: 'medium',
    responsible: undefined,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const getUserDisplayName = (user: User) => {
    const nameParts = [user.first_name, user.last_name]
      .map(part => (part || '').trim())
      .filter(part => part.length > 0);

    return nameParts.length > 0 ? nameParts.join(' ') : user.username;
  };

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'responsible' ? (value === '' ? undefined : parseInt(value)) : value,
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Data de início é obrigatória';
    }

    if (!formData.predicted_date) {
      newErrors.predicted_date = 'Data prevista é obrigatória';
    }

    if (formData.start_date && formData.predicted_date) {
      const startDate = new Date(formData.start_date);
      const predictedDate = new Date(formData.predicted_date);
      
      if (predictedDate < startDate) {
        newErrors.predicted_date = 'Data prevista deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
          Título *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`text-slate-900 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
            errors.title ? 'border-red-300' : 'border-slate-300'
          }`}
          placeholder="Digite o título da ordem de serviço"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
          Descrição *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className={`text-slate-700 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
            errors.description ? 'border-red-300' : 'border-slate-300'
          }`}
          placeholder="Descreva detalhadamente o serviço a ser realizado"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data de início */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-2">
            Data de Início *
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className={`text-slate-700 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
              errors.start_date ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
          )}
        </div>

        {/* Data prevista */}
        <div>
          <label htmlFor="predicted_date" className="block text-sm font-medium text-slate-700 mb-2">
            Data Prevista *
          </label>
          <input
            type="date"
            id="predicted_date"
            name="predicted_date"
            value={formData.predicted_date}
            onChange={handleChange}
            className={`text-slate-700 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
              errors.predicted_date ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors.predicted_date && (
            <p className="mt-1 text-sm text-red-600">{errors.predicted_date}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prioridade */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
            Prioridade
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="text-slate-700 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {Object.entries(PRIORITY_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Responsável */}
        <div>
          <label htmlFor="responsible" className="block text-sm font-medium text-slate-700 mb-2">
            Responsável
          </label>
          <select
            id="responsible"
            name="responsible"
            value={formData.responsible || ''}
            onChange={handleChange}
            className="text-slate-700 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="">Selecione um responsável</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {getUserDisplayName(user)} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
}