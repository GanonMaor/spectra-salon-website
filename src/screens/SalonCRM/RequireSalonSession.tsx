import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasActiveSalonSession } from "./data/salonSession";

/**
 * Route guard for /crm/*.
 *
 * The CRM must never silently load a default tenant (e.g. salon-look). If there
 * is no active salon session, redirect to the login screen and preserve the
 * originally requested path so the user returns there after logging in.
 *
 * "Active session" means either a signed bearer token (production) or a local
 * dev login state (local dev issues no token). Runtime APIs still derive
 * salon_id from the verified session server-side — this guard only gates the UI.
 */
const RequireSalonSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (!hasActiveSalonSession()) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/user-login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <>{children}</>;
};

export default RequireSalonSession;
