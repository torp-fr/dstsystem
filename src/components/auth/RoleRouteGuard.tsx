import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

/**
 * RoleRouteGuard — PRODUCTION SAFE VERSION
 *
 * FIXES:
 * - Waits for AuthContext loading
 * - No navigation inside useEffect
 * - No redirect loops
 * - No redirect while role undefined
 */

interface RoleRouteGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleRouteGuard({
  children,
  allowedRoles,
  fallbackPath = '/dashboard/cockpit',
}: RoleRouteGuardProps) {
  const { user, loading } = useAuth();

  const [userRole, setUserRole] = useState<string | null | undefined>(undefined);

  /**
   * 🔐 Resolve role ONLY when auth is ready
   */
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setUserRole(null);
      return;
    }

    const role =
      user.user_metadata?.role ||
      (user as any).app_metadata?.role ||
      localStorage.getItem('user_role') ||
      null;

    setUserRole(role);
  }, [user, loading]);

  /**
   * 🧠 IMPORTANT LOGIC ORDER
   */

  // 1️⃣ Auth still loading → wait
  if (loading) {
    return null;
  }

  // 2️⃣ No user → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Role still resolving → wait
  if (userRole === undefined) {
    return null;
  }

  // 4️⃣ No role found → login
  if (!userRole) {
    console.warn('[RoleGuard] No user role found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // 5️⃣ Role not allowed → fallback
  if (!allowedRoles.includes(userRole)) {
    console.warn(
      `[RoleGuard] Unauthorized access. Role '${userRole}' not allowed. Redirecting to ${fallbackPath}`
    );
    return <Navigate to={fallbackPath} replace />;
  }

  // ✅ Authorized
  return <>{children}</>;
}

/**
 * Hook to get current user role
 */
export function useUserRole(): string | null {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    const userRole =
      user.user_metadata?.role ||
      (user as any).app_metadata?.role ||
      localStorage.getItem('user_role') ||
      null;

    setRole(userRole);
  }, [user]);

  return role;
}

/**
 * HOC helper
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
