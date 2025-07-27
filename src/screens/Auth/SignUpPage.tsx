import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTrial = searchParams.get('trial') === 'true';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await apiClient.signup(formData);
      setSuccess(true);
      setTimeout(() => {
        // Redirect admin users to admin dashboard
        if (formData.email === 'maor@spectra-ci.com') {
          navigate('/admin');
        } else {
          navigate(isTrial ? '/' : '/');
        }
      }, 2000);
    } catch (error: any) {
      if (error.message.includes('User already exists')) {
        setError('An account with this email already exists');
      } else {
        setError(error.message || 'An error occurred during sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spectra-cream via-white to-spectra-cream-dark">
        <div className="max-w-md w-full text-center space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            ✓
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-spectra-charcoal to-spectra-charcoal-light bg-clip-text text-transparent">
            Account Created Successfully!
          </h2>
          <p className="text-gray-600">Redirecting you to dashboard...</p>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spectra-cream via-white to-spectra-cream-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Spectra Brand */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-spectra-gold to-spectra-gold-dark rounded-full flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-spectra-charcoal to-spectra-charcoal-light bg-clip-text text-transparent">
            {isTrial ? 'Start Your Free Trial' : 'Create Your Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-spectra-gold hover:text-spectra-gold-dark transition-colors duration-300"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-spectra-gold/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-spectra-charcoal">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-spectra-charcoal rounded-xl focus:outline-none focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold transition-all duration-300 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-spectra-charcoal">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-spectra-charcoal rounded-xl focus:outline-none focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold transition-all duration-300 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-spectra-charcoal">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-spectra-charcoal rounded-xl focus:outline-none focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold transition-all duration-300 sm:text-sm"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-spectra-charcoal">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-spectra-charcoal rounded-xl focus:outline-none focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold transition-all duration-300 sm:text-sm"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-spectra-gold to-spectra-gold-dark hover:from-spectra-gold-dark hover:to-spectra-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spectra-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  isTrial ? 'Start Free Trial' : 'Create Account'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Spectra Salon Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 