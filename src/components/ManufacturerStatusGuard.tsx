import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ManufacturerStatusGuardProps {
  children: ReactNode;
  requireApproved?: boolean;
}

/**
 * ManufacturerStatusGuard - Protects routes based on manufacturer approval status
 * 
 * @param requireApproved - If true, only APPROVED manufacturers can access
 *                         If false, only non-APPROVED manufacturers can access (onboarding)
 */
export function ManufacturerStatusGuard({
  children,
  requireApproved = true
}: ManufacturerStatusGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || user.role !== 'manufacturer') {
    return <Navigate to="/login" replace />;
  }

  const isApproved = user.status === 'APPROVED';

  // If route requires approval but user is not approved, redirect to onboarding
  if (requireApproved && !isApproved) {
    return <Navigate to="/manufacturer/onboarding" replace />;
  }

  // If route is for non-approved (onboarding) but user is approved, redirect to dashboard
  if (!requireApproved && isApproved) {
    return <Navigate to="/manufacturer" replace />;
  }

  return <>{children}</>;
}
