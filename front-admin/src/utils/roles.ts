import type { UserRole } from '../interfaces/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  maintenance: 0,
  housekeeping: 1,
  reception: 2,
  manager: 3,
  owner: 4,
  super_admin: 5,
};

export function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[minRole] ?? 99);
}

const ROLE_LABELS: Record<UserRole, string> = {
  maintenance: 'Mantenimiento',
  housekeeping: 'Housekeeping',
  reception: 'Recepción',
  manager: 'Gerente',
  owner: 'Propietario',
  super_admin: 'Super Admin',
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}
