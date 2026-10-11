import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ensureLocalDevSalonSession, hasActiveSalonSession } from "./data/salonSession";

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
 *
 * Workshop routes may seed a localhost demo session so local design work can
 * start without production credentials. `ensureLocalDevSalonSession` refuses
 * to run outside localhost / 127.0.0.1.
 */
const LOCAL_WORKSHOP_PREFIXES = ["/crm/marketing", "/crm/new-page"];

const RequireSalonSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isWorkshopPage = LOCAL_WORKSHOP_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  if (!hasActiveSalonSession()) {
    if (isWorkshopPage && ensureLocalDevSalonSession()) {
      return <>{children}</>;
    }
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/user-login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <>{children}</>;
};

export default RequireSalonSession;
