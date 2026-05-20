import { api } from './client';
import { HistoryEntry, ServiceTask, TaskStatus } from '../types';

export async function fetchMyTasks(params?: {
  status?: string;
  priority?: string;
  search?: string;
}) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.priority) q.set('priority', params.priority);
  if (params?.search) q.set('search', params.search);
  const query = q.toString() ? `?${q}` : '';
  const res = await api<{ items: ServiceTask[] }>(`/api/requests${query}`);
  return res.items;
}

export async function fetchTaskHistory(taskId: string) {
  const res = await api<{ items: HistoryEntry[] }>(`/api/requests/${taskId}/history`);
  return res.items;
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  note?: string,
  photoBase64?: string,
) {
  const res = await api<{ item: ServiceTask }>(`/api/requests/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note, photoBase64 }),
  });
  return res.item;
}
