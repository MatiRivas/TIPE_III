// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { Role } from '../types/user.types';

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const user = useAuthStore((state) => state.user);

  // Si no hay sesión, redirige al login
  if (!user) return <Navigate to="/" replace />;

  // Si no tiene el rol requerido, redirige al inicio
  if (!allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}