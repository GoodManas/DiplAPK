import { TaskStatus } from '../types';

const labels: Record<TaskStatus, string> = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  completed: 'Выполнена',
  cancelled: 'Отменена',
};

const colors: Record<TaskStatus, string> = {
  new: '#64748b',
  assigned: '#2563eb',
  in_progress: '#d97706',
  completed: '#16a34a',
  cancelled: '#dc2626',
};

export function getStatusLabel(status: TaskStatus) {
  return labels[status];
}

export function getStatusColor(status: TaskStatus) {
  return colors[status];
}
