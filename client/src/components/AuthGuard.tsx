import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireSetup?: boolean;
}

export function AuthGuard({ children, fallback, requireSetup = false }: AuthGuardProps) {
  const { user, userSettings, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || null;
  }

  if (requireSetup && (!userSettings || !userSettings.setupCompleted)) {
    return fallback || null;
  }

  return <>{children}</>;
}
