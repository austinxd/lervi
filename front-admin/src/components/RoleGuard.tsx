import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { hasMinRole } from '../utils/roles';
import type { UserRole } from '../interfaces/types';

interface Props {
  minRole: UserRole;
  children: React.ReactNode;
}

export default function RoleGuard({ minRole, children }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user || !hasMinRole(user.role, minRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
