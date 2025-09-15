"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("freelancer" | "client" | "admin")[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo,
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { user: storeUser, profile, isLoading: storeLoading } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading || storeLoading) return;

    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      // Check authentication using both sources
      const isActuallyAuthenticated =
        (user && profile) || (storeUser && profile);

      if (requireAuth && !isActuallyAuthenticated) {
        console.log("RouteGuard: Redirecting to login - not authenticated");
        router.push("/auth/login");
        return;
      }

      // Check role permissions
      const userRole = user?.role || profile?.role;
      if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        console.log(
          "RouteGuard: Redirecting to unauthorized - role not allowed"
        );
        router.push(redirectTo || "/unauthorized");
        return;
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [
    isAuthenticated,
    user,
    profile,
    storeUser,
    isLoading,
    storeLoading,
    allowedRoles,
    requireAuth,
    redirectTo,
    router,
  ]);

  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Check authentication using both sources
  const isActuallyAuthenticated = (user && profile) || (storeUser && profile);

  if (requireAuth && !isActuallyAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role permissions
  const userRole = user?.role || profile?.role;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function ClientOnly({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedRoles={["client", "admin"]}>{children}</RouteGuard>;
}

export function FreelancerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["freelancer", "admin"]}>{children}</RouteGuard>
  );
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedRoles={["admin"]}>{children}</RouteGuard>;
}

export function AuthRequired({ children }: { children: React.ReactNode }) {
  return <RouteGuard requireAuth={true}>{children}</RouteGuard>;
}
