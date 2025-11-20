// Configurações da API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/token/`,
  REFRESH: `${API_BASE_URL}/api/token/refresh/`,
  CURRENT_USER: `${API_BASE_URL}/api/users/me/`,
  USER_PERMISSIONS: `${API_BASE_URL}/api/users/me/permissions/`,
  USERS_LIST: `${API_BASE_URL}/api/users/`,
  
  // Service Orders endpoints
  SERVICE_ORDERS: `${API_BASE_URL}/api/v1/service-orders/`,
  SERVICE_ORDER_DETAIL: (id: number) => `${API_BASE_URL}/api/v1/service-orders/${id}/`,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_PAGE_SIZE = 10;