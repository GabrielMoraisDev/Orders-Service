// Utilitários para formatação e manipulação de dados

import { ServiceOrder } from './types';

// Formatação de datas
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Converter data para formato de input
export const dateToInputFormat = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Mapas de tradução
export const PRIORITY_MAP = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
} as const;

export const STATUS_MAP = {
  open: 'Aberta',
  closed: 'Fechada',
  unresolved: 'Não Resolvida',
} as const;

// Classes CSS para prioridades
export const PRIORITY_STYLES = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  high: 'bg-red-100 text-red-800 border-red-200',
} as const;

// Classes CSS para status
export const STATUS_STYLES = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-green-100 text-green-800 border-green-200',
  unresolved: 'bg-red-100 text-red-800 border-red-200',
} as const;

// Verificar se ordem está atrasada
export const isOrderOverdue = (order: ServiceOrder) => {
  if (order.status === 'closed') return false;
  const today = new Date();
  const predictedDate = new Date(order.predicted_date);
  return today > predictedDate;
};

// Calcular dias até o prazo
export const getDaysUntilDeadline = (predictedDate: string) => {
  const today = new Date();
  const deadline = new Date(predictedDate);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Limpar filtros vazios
export const cleanFilters = (filters: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
};

// Gerar initials do nome
export const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Truncar texto
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validar email
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};