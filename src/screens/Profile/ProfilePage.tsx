import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MainLayout } from '../../layouts/MainLayout';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUserContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.logout();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('auth_token');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const mockPayments = [
    { id: 1, date: '2024-01-15', amount: 299, status: 'completed', service: 'Premium Subscription' },
    { id: 2, date: '2023-12-15', amount: 199, status: 'completed', service: 'Color Analysis' },
    { id: 3, date: '2023-11-10', amount: 149, status: 'completed', service: 'Style Consultation' },
  ];

  const tabs = [
    { id: 'profile', name: 'Personal Profile', icon: '👤' },
    { id: 'payments', name: 'Payment History', icon: '💳' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-amber-100/50 p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Hello, {user.full_name || user.email}
                </h1>
                <p className="text-gray-600 mt-2">Welcome to your personal dashboard</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'partner' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? '👑 Admin' : 
                     user.role === 'partner' ? '🤝 Partner' : '✨ User'}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoggingOut ? (
                  <>
                    <LoadingSpinner />
                    Logging out...
                  </>
                ) : (
                  <>
                    🚪 Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-amber-100/50 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{tab.icon}</span>
                      {tab.name}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <p className="text-gray-900 font-medium">{user.full_name || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                      <p className="text-gray-900 font-medium">
                        {new Date(user.created_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                      ✏️ Edit Profile
                    </Button>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h2>
                  
                  <div className="space-y-4">
                    {mockPayments.map((payment) => (
                      <div key={payment.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{payment.service}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(payment.date).toLocaleDateString('en-US')}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-green-600">
                              ${payment.amount}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {mockPayments.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💳</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                      <p className="text-gray-600">When you make payments, they will appear here</p>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates about services and news</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                        <p className="text-sm text-gray-600">Receive text messages about appointments and updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-700 mb-4">Actions that cannot be undone</p>
                      <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        🗑️ Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage; 