/**
 * Route guard: redirects unauthenticated users to login
 * and users without profile/enterprise to onboarding.
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import { Loader2 } from "lucide-react";

export const RequireAuth = () => {
  const { jwt, loading, profile, enterprise } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!jwt) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no profile/enterprise yet and not already on onboarding
  if ((!profile || !enterprise) && location.pathname !== "/app/onboarding") {
    return <Navigate to="/app/onboarding" replace />;
  }

  return <Outlet />;
};

export const RedirectIfAuth = () => {
  const { jwt, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (jwt) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};
