// Tipos para as entidades do backend

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface ServiceOrder {
  id: number;
  title: string;
  description: string;
  resolved?: string;
  start_date: string;
  predicted_date: string;
  completion_date?: string;
  days_delay: number;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'unresolved';
  from_user: number;
  responsible?: number;
  rate?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderCreate {
  title: string;
  description: string;
  resolved?: string;
  start_date: string;
  predicted_date: string;
  completion_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'unresolved';
  from_user: number;
  responsible?: number;
  rate?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardStats {
  total_orders: number;
  open_orders: number;
  closed_orders: number;
  unresolved_orders: number;
  high_priority_orders: number;
  overdue_orders: number;
}

// Tipos para formulários
export interface ServiceOrderFormData {
  title: string;
  description: string;
  start_date: string;
  predicted_date: string;
  priority: 'low' | 'medium' | 'high';
  responsible?: number;
}

// Tipos para filtros
export interface OrderFilters {
  status?: string;
  priority?: string;
  responsible?: number;
  search?: string;
  start_date_from?: string;
  start_date_to?: string;
  page?: number;
  page_size?: number;
}