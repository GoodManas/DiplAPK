import type { EmployeeRow, RequestRow } from './types.js';

export function mapEmployee(row: EmployeeRow) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone ?? undefined,
    isActive: row.is_active !== 0,
  };
}

export function mapRequest(row: RequestRow & { assignee_name?: string | null }) {
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    clientPhone: row.client_phone ?? undefined,
    address: row.address,
    description: row.description ?? '',
    scheduledAt: row.scheduled_at,
    status: row.status,
    priority: row.priority ?? 'normal',
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    assigneeId: row.assignee_id ?? undefined,
    assigneeName: row.assignee_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHistory(row: {
  id: number;
  request_id: string;
  employee_id: number;
  status_from: string | null;
  status_to: string;
  note: string | null;
  photo_data: string | null;
  created_at: string;
  employee_name: string;
}) {
  return {
    id: row.id,
    requestId: row.request_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    statusFrom: row.status_from,
    statusTo: row.status_to,
    note: row.note,
    hasPhoto: Boolean(row.photo_data),
    createdAt: row.created_at,
  };
}
