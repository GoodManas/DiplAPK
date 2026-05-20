import { api, setAuthToken } from './client';
import { Executor, RolePermissions } from '../types';
import { clearStoredToken, saveStoredToken } from '../storage';

export async function loginApi(employeeCode: string, password: string) {
  const res = await api<{
    token: string;
    user: Executor & { role: string };
    permissions: RolePermissions;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ employeeCode, password }),
  });

  if (res.user.role !== 'executor') {
    throw new Error('Мобильное приложение только для выездных специалистов');
  }

  setAuthToken(res.token);
  await saveStoredToken(res.token);
  return { token: res.token, executor: res.user, permissions: res.permissions };
}

export async function fetchMeApi() {
  return api<{ user: Executor & { role: string }; permissions: RolePermissions }>(
    '/api/auth/me',
  );
}

export async function changePasswordApi(currentPassword: string, newPassword: string) {
  return api<{ ok: boolean }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function logoutApi() {
  setAuthToken(null);
  void clearStoredToken();
}
