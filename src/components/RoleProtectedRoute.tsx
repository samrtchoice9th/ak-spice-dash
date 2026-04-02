
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin';
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, requiredRole = 'admin' }) => {
  const { isAdmin, isSuperAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (requiredRole === 'super_admin' && !isSuperAdmin) {
    return <Navigate to="/sales" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/sales" replace />;
  }

  return <>{children}</>;
};
