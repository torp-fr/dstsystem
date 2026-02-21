import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

/**
 * RoleRouteGuard — Role-Based Route Protection
 *
 * Guards routes based on user role from AuthContext.
 * Redirects unauthorized users to dashboard home.
 *
 * PURE SECURITY LAYER:
 * - Does NOT modify UI or business logic
 * - Does NOT change route structure
 * - Only adds access control check
 */

interface RoleRouteGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

/**
 * RoleRouteGuard Component
 *
 * Usage:
 * <RoleRouteGuard allowedRoles={['enterprise']}>
 *   <CockpitPage />
 * </RoleRouteGuard>
 */
export default function RoleRouteGuard({
  children,
  allowedRoles,
  fallbackPath = '/dashboard/cockpit',
}: RoleRouteGuardProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Get user role from user metadata or localStorage
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!user) {
          navigate('/auth/login');
          return;
        }

        // Try to get role from user metadata, app_metadata, or localStorage
        const role =
          user.user_metadata?.role ||
          (user as any).app_metadata?.role ||
          localStorage.getItem('user_role') ||
          null;

        if (!role) {
          console.warn('[RoleGuard] No user role found, redirecting to login');
          navigate('/auth/login', { replace: true });
          return;
        }

        setUserRole(role);

        // Check if role is authorized for this route
        if (!allowedRoles.includes(role)) {
          console.warn(
            `[RoleGuard] Unauthorized access. Role '${role}' not in [${allowedRoles.join(', ')}]. Redirecting to ${fallbackPath}`
          );
          navigate(fallbackPath, { replace: true });
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error('[RoleGuard] Error checking role:', error);
        navigate(fallbackPath, { replace: true });
      }
    };

    if (!loading) {
      checkUserRole();
    }
  }, [user, loading, allowedRoles, navigate, fallbackPath]);

  // Show nothing while checking
  if (loading || checking) {
    return null;
  }

  // If we get here, user is authorized
  return <>{children}</>;
}

/**
 * Hook to get current user role
 *
 * Usage:
 * const role = useUserRole();
 * if (role === 'enterprise') { ... }
 */
export function useUserRole(): string | null {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    const userRole = user.user_metadata?.role ||
                     localStorage.getItem('user_role') ||
                     null;
    setRole(userRole);
  }, [user]);

  return role;
}

/**
 * Higher-order component for protecting routes
 *
 * Usage:
 * const ProtectedCockpit = withRoleGuard(CockpitPage, ['enterprise']);
 * <Route path="/dashboard/cockpit" element={<ProtectedCockpit />} />
 */
export function withRoleGuard(
  Component: React.ComponentType<any>,
  allowedRoles: string[],
  fallbackPath?: string
) {
  return function GuardedComponent(props: any) {
    return (
      <RoleRouteGuard allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
        <Component {...props} />
      </RoleRouteGuard>
    );
  };
}
