export type UserRole = 'dispatcher' | 'executor';
export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type JwtPayload = {
  sub: number;
  role: UserRole;
  employeeCode: string;
};

export type Priority = 'low' | 'normal' | 'high';

export type EmployeeRow = {
  id: number;
  employee_code: string;
  full_name: string;
  password_hash: string;
  role: UserRole;
  phone: string | null;
  is_active: number;
  created_at: string;
};

export type RequestRow = {
  id: string;
  title: string;
  client_name: string;
  client_phone: string | null;
  address: string;
  description: string | null;
  scheduled_at: string;
  status: RequestStatus;
  priority: Priority | string | null;
  latitude: number | null;
  longitude: number | null;
  assignee_id: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};
