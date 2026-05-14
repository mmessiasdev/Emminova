/**
 * Route guard: redirects unauthenticated users to login.
 * The dashboard itself handles the "no enterprise" empty state.
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import { Loader2 } from "lucide-react";

export const RequireAuth = () => {
  const { jwt, loading } = useAuth();
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
