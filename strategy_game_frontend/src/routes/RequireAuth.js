import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";

// PUBLIC_INTERFACE
export function RequireAuth({ children }) {
  /** Route guard that redirects to /auth when the user is not logged in. */
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}
