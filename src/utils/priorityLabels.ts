import { Priority } from '../types';

const labels: Record<Priority, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Срочный',
};

const colors: Record<Priority, string> = {
  low: '#64748b',
  normal: '#2563eb',
  high: '#dc2626',
};

export function getPriorityLabel(p: Priority) {
  return labels[p] ?? p;
}

export function getPriorityColor(p: Priority) {
  return colors[p] ?? '#64748b';
}
