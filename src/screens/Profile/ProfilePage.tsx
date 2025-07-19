import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MainLayout } from '../../layouts/MainLayout';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { useToast } from '../../components/ui/toast';
import { apiClient } from '../../api/client';

interface ProfileFormData {
  full_name: string;
  phone: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useUserContext();
  const { addToast } = useToast();
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Initialize form when user loads
  React.useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      // עכשיו נשתמש ב-API אמיתי!
      await apiClient.updateProfile({
        full_name: profileForm.full_name,
        phone: profileForm.phone
      });
      
      // רענן את נתוני המשתמש מהשרת
      await refreshUser();
      
      addToast({
        type: 'success',
        message: 'Profile updated successfully!',
        duration: 4000
      });
      
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      addToast({
        type: 'error',
        message: error.message || 'Failed to update profile',
        duration: 5000
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        type: 'error',
        message: 'New passwords do not match',
        duration: 4000
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      addToast({
        type: 'error',
        message: 'Password must be at least 8 characters long',
        duration: 4000
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      // TODO: Add API call to update password
      // await apiClient.updatePassword(passwordForm);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast({
        type: 'success',
        message: 'Password updated successfully!',
        duration: 4000
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowPasswordModal(false);
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to update password',
        duration: 5000
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      // TODO: Add API call to delete account
      // await apiClient.deleteAccount();
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear auth and redirect
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      addToast({
        type: 'info',
        message: 'Account deleted successfully',
        duration: 4000
      });
      
      navigate('/');
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to delete account',
        duration: 5000
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#EAB776] to-[#B18059] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.full_name || 'User Profile'}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Joined {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-gray-900">{user.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  🔐 Change Password
                </Button>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h3>
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="md"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B18059] focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B18059] focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B18059] focus:border-transparent"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={isUpdatingProfile}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B18059] focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B18059] focus:border-transparent"
              minLength={8}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B18059] focus:border-transparent"
              minLength={8}
              required
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              disabled={isUpdatingPassword}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data."
        confirmText="Yes, Delete Account"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeletingAccount}
      />
    </MainLayout>
  );
};

export default ProfilePage; 