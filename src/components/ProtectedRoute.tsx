import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user is a manufacturer and not yet approved, redirect them to the onboarding page
  if (user.role === 'manufacturer') {
    const localKey = `manufacturer_approved_${user.id}`;
    const localApproved = typeof window !== 'undefined' && localStorage.getItem(localKey) === 'true';
    const isApproved = localApproved; // server-driven approval would be checked on the user object in a real app
    // allow the onboarding path itself to load
    if (!isApproved && !location.pathname.startsWith('/manufacturer/onboarding')) {
      return <Navigate to="/manufacturer/onboarding" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard
    const redirectPath = user.role === 'super-admin' 
      ? '/super-admin' 
      : `/${user.role}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}