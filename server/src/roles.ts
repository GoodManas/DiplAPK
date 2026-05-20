import type { UserRole } from './types.js';

/** Права ролей для пояснительной записки и middleware */
export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    label: string;
    canManageEmployees: boolean;
    canCreateRequests: boolean;
    canAssignRequests: boolean;
    canCancelRequests: boolean;
    canViewAllRequests: boolean;
    canUpdateOwnTaskStatus: boolean;
  }
> = {
  dispatcher: {
    label: 'Диспетчер',
    canManageEmployees: true,
    canCreateRequests: true,
    canAssignRequests: true,
    canCancelRequests: true,
    canViewAllRequests: true,
    canUpdateOwnTaskStatus: true,
  },
  executor: {
    label: 'Выездной специалист',
    canManageEmployees: false,
    canCreateRequests: false,
    canAssignRequests: false,
    canCancelRequests: false,
    canViewAllRequests: false,
    canUpdateOwnTaskStatus: true,
  },
};
