import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { apiClient } from '../../api/client';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface DashboardStats {
  leads: {
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  } | null;
  users: any[] | null;
}

const AdminDashboard: React.FC = () => {
  const { user, loading: userLoading } = useUserContext();
  const [stats, setStats] = useState<DashboardStats>({
    leads: null,
    users: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load leads
        const leadsResponse = await apiClient.getLeads({ limit: 100 });
        
        // Load users
        const usersResponse = await apiClient.getUsers();
        
        // Calculate leads stats
        const leads = leadsResponse.leads || [];
        const leadsStats = {
          total: leads.length,
          byStatus: leads.reduce((acc: any, lead: any) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
          }, {}),
          bySource: leads.reduce((acc: any, lead: any) => {
            const source = lead.source || 'unknown';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
          }, {})
        };

        setStats({
          leads: leadsStats,
          users: usersResponse
        });
        
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link
            to="/"
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">L</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Leads
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.leads?.total || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">U</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Users
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.users?.length || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">N</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          New Leads
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.leads?.byStatus?.new || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leads by Status */}
            {stats.leads && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leads by Status</h3>
                <div className="space-y-2">
                  {Object.entries(stats.leads.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="capitalize text-gray-600">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users List */}
            {stats.users && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.users.slice(0, 10).map((user: any) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.full_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 