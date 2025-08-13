import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { UserPlusIcon, UserIcon } from "@heroicons/react/24/outline";

interface SystemUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_login?: string;
}

const SystemUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // First show placeholder data
        setUsers([
          {
            id: 1,
            email: "maor@spectra-ci.com",
            full_name: "Maor Ganon",
            role: "admin",
            created_at: "2024-01-01",
            last_login: "2024-01-09",
          },
          {
            id: 2,
            email: "danny@spectra-ci.com",
            full_name: "Danny Michaeli",
            role: "admin",
            created_at: "2024-01-01",
            last_login: "2024-01-08",
          },
          {
            id: 3,
            email: "elad@spectra-ci.com",
            full_name: "Elad Gottlieb",
            role: "admin",
            created_at: "2024-01-01",
            last_login: "2024-01-07",
          },
        ]);

        // Try to load real users from DB
        try {
          const response = await fetch("/.netlify/functions/get-users");
          if (response.ok) {
            const realUsers = await response.json();
            if (realUsers && realUsers.length > 0) {
              setUsers(
                realUsers.map((user: any) => ({
                  id: user.id,
                  email: user.email,
                  full_name: user.full_name,
                  role: user.role,
                  created_at: user.created_at,
                  last_login: user.last_login,
                })),
              );
            }
          }
        } catch (apiError) {
          console.log("Using placeholder data - API not available:", apiError);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "System", href: "/admin/system" },
          { label: "Users", href: "/admin/system/users" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Admin Team</h3>
          <p className="text-sm text-gray-600">
            Manage system access and permissions
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemUsersPage;
