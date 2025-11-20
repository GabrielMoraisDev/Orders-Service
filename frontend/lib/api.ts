// Funções para fazer chamadas à API

import { 
  AuthTokens, 
  LoginCredentials, 
  ServiceOrder, 
  ServiceOrderCreate, 
  User, 
  ApiResponse,
  OrderFilters 
} from './types';
import { API_ENDPOINTS, HTTP_STATUS } from './config';
import { cleanFilters } from './utils';

// Classe para erros da API
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Configuração base do fetch
const createFetchConfig = (options: RequestInit = {}): RequestInit => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  return config;
};

// Função para fazer requests autenticados
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const config = createFetchConfig({
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const response = await fetch(url, config);
  
  // Se token expirou, tentar renovar
  if (response.status === HTTP_STATUS.UNAUTHORIZED && token) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry com novo token
      const newConfig = createFetchConfig({
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${refreshed.access}`,
        },
      });
      return fetch(url, newConfig);
    }
  }

  return response;
};

// Função para processar resposta
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}`,
      errorData
    );
  }

  // Para respostas sem conteúdo (como DELETE)
  if (response.status === HTTP_STATUS.NO_CONTENT) {
    return {} as T;
  }

  return response.json();
};

// Funções de autenticação
export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await handleResponse<AuthTokens>(response);
  
  // Salvar tokens no localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
  }

  return data;
};

export const refreshToken = async (): Promise<AuthTokens | null> => {
  const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  
  if (!refresh) return null;

  try {
    const response = await fetch(API_ENDPOINTS.REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    const data = await handleResponse<AuthTokens>(response);
    
    // Atualizar tokens no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    }

    return data;
  } catch {
    // Se refresh falhou, limpar tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    return null;
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await authenticatedFetch(API_ENDPOINTS.CURRENT_USER);
  return handleResponse<User>(response);
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await authenticatedFetch(API_ENDPOINTS.USERS_LIST);
  const data = await handleResponse<User[] | { results: User[] }>(response);
  
  // Se vier com paginação, extrai os results
  if (!Array.isArray(data) && 'results' in data) {
    return data.results;
  }
  
  return Array.isArray(data) ? data : [];
};

// Funções para ordens de serviço
export const getServiceOrders = async (filters?: OrderFilters): Promise<ApiResponse<ServiceOrder>> => {
  const params = new URLSearchParams();
  if (filters) {
    const cleanedFilters = cleanFilters(filters as Record<string, unknown>);
    Object.entries(cleanedFilters).forEach(([key, value]) => {
      params.append(key, String(value));
    });
  }
  const url = `${API_ENDPOINTS.SERVICE_ORDERS}?${params.toString()}`;
  const response = await authenticatedFetch(url);
  const data = await handleResponse<ApiResponse<ServiceOrder> | ServiceOrder[]>(response);

  // Se vier array, converte para objeto paginado
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }
  return data;
};

export const getServiceOrder = async (id: number): Promise<ServiceOrder> => {
  const response = await authenticatedFetch(API_ENDPOINTS.SERVICE_ORDER_DETAIL(id));
  return handleResponse<ServiceOrder>(response);
};

export const createServiceOrder = async (data: ServiceOrderCreate): Promise<ServiceOrder> => {
  const response = await authenticatedFetch(API_ENDPOINTS.SERVICE_ORDERS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ServiceOrder>(response);
};

export const updateServiceOrder = async (id: number, data: Partial<ServiceOrderCreate>): Promise<ServiceOrder> => {
  const response = await authenticatedFetch(API_ENDPOINTS.SERVICE_ORDER_DETAIL(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return handleResponse<ServiceOrder>(response);
};

export const deleteServiceOrder = async (id: number): Promise<void> => {
  const response = await authenticatedFetch(API_ENDPOINTS.SERVICE_ORDER_DETAIL(id), {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
};

// Funções para gerenciar usuários
export interface UserData {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active?: boolean;
  password?: string;
  groups: number[];
  user_permissions: number[];
}

export const getUser = async (userId: number): Promise<UserData> => {
  const response = await authenticatedFetch(`http://localhost:8000/api/users/${userId}/`);
  return handleResponse<UserData>(response);
};

export const updateUser = async (userId: number, data: Partial<UserData>): Promise<UserData> => {
  const response = await authenticatedFetch(`http://localhost:8000/api/users/${userId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return handleResponse<UserData>(response);
};

export const deleteUser = async (userId: number): Promise<void> => {
  const response = await authenticatedFetch(`http://localhost:8000/api/users/${userId}/`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
};

// Função para obter estatísticas do dashboard
export const getDashboardStats = async () => {
  // Como não temos endpoint específico, vamos calcular baseado na listagem
  const orders = await getServiceOrders({ page_size: 1000 }); // Pegar todos
  const results = Array.isArray(orders.results) ? orders.results : [];
  const stats = {
    total_orders: orders.count || 0,
    open_orders: results.filter(o => o.status === 'open').length,
    closed_orders: results.filter(o => o.status === 'closed').length,
    unresolved_orders: results.filter(o => o.status === 'unresolved').length,
    high_priority_orders: results.filter(o => o.priority === 'high').length,
    overdue_orders: results.filter(o => {
      if (o.status === 'closed') return false;
      return new Date() > new Date(o.predicted_date);
    }).length,
  };

  return stats;
};