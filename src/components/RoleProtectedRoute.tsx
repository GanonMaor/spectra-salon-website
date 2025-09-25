import React from "react";
import { useUserContext } from "../context/UserContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = null,
}) => {
  const { user, loading } = useUserContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no role requirements, show content
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRequiredRole = user?.role && requiredRoles.includes(user.role);

  if (!hasRequiredRole) {
    return (
      fallback || (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this section.
          </p>
          <p className="text-sm text-gray-500">
            Required roles: {requiredRoles.join(", ")}
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
