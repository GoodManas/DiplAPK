const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type User = {
  id: number;
  employeeCode: string;
  fullName: string;
  role: 'dispatcher' | 'executor';
  phone?: string;
  isActive?: boolean;
};

export type ServiceRequest = {
  id: string;
  title: string;
  clientName: string;
  clientPhone?: string;
  address: string;
  description: string;
  scheduledAt: string;
  status: string;
  priority: string;
  assigneeId?: number;
  assigneeName?: string;
};

export type Stats = {
  total: number;
  byStatus: Record<string, number>;
  executorsActive: number;
  scheduledToday: number;
  highPriorityOpen: number;
};

function getToken() {
  return localStorage.getItem('dp_token');
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error(
      'Нет связи с сервером. Запустите в папке DP: npm run server (порт 3001)',
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error;
    if (res.status === 404 && !msg) {
      throw new Error(
        'Маршрут API не найден. Перезапустите сервер: npm run server',
      );
    }
    throw new Error(msg ?? `Ошибка ${res.status}`);
  }
  return data as T;
}

export function saveSession(token: string) {
  localStorage.setItem('dp_token', token);
}

export function clearSession() {
  localStorage.removeItem('dp_token');
}

export async function login(employeeCode: string, password: string) {
  return api<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ employeeCode, password }),
  });
}

export async function fetchMe() {
  return api<{ user: User }>('/api/auth/me');
}

export async function fetchStats() {
  return api<Stats>('/api/stats');
}

export async function fetchRequests(params?: {
  status?: string;
  priority?: string;
  search?: string;
}) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.priority) q.set('priority', params.priority);
  if (params?.search) q.set('search', params.search);
  const query = q.toString() ? `?${q}` : '';
  return api<{ items: ServiceRequest[] }>(`/api/requests${query}`);
}

export async function fetchExecutors() {
  return api<{ items: User[] }>('/api/employees/executors');
}

export async function fetchAllEmployees() {
  return api<{ items: User[] }>('/api/employees');
}

export async function createRequest(body: Record<string, unknown>) {
  return api<{ item: ServiceRequest }>('/api/requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function assignRequest(id: string, assigneeId: number) {
  return api<{ item: ServiceRequest }>(`/api/requests/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigneeId }),
  });
}

export async function cancelRequest(id: string, reason: string) {
  return api<{ item: ServiceRequest }>(`/api/requests/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function createEmployee(body: Record<string, unknown>) {
  return api<{ item: User }>('/api/employees', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchHistory(requestId: string) {
  return api<{
    items: {
      id: number;
      employeeName: string;
      statusFrom: string | null;
      statusTo: string;
      note: string | null;
      hasPhoto: boolean;
      createdAt: string;
    }[];
  }>(`/api/requests/${requestId}/history`);
}
