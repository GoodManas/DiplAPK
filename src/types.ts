export type TaskStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type Priority = 'low' | 'normal' | 'high';

export type ServiceTask = {
  id: string;
  title: string;
  clientName: string;
  clientPhone?: string;
  address: string;
  scheduledAt: string;
  status: TaskStatus;
  priority: Priority;
  description: string;
  latitude?: number;
  longitude?: number;
};

export type Executor = {
  id: number | string;
  fullName: string;
  employeeCode: string;
  role?: string;
  phone?: string;
};

export type RolePermissions = {
  label: string;
  canManageEmployees: boolean;
  canCreateRequests: boolean;
  canAssignRequests: boolean;
  canCancelRequests: boolean;
  canViewAllRequests: boolean;
  canUpdateOwnTaskStatus: boolean;
};

export type HistoryEntry = {
  id: number;
  requestId: string;
  employeeName: string;
  statusFrom: string | null;
  statusTo: string;
  note: string | null;
  hasPhoto: boolean;
  createdAt: string;
};
