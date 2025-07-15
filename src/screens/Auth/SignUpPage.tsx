import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signUpWithEmail, SignUpData } from '../../api/supabase/userApi';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTrial = searchParams.get('trial') === 'true';
  
  const [formData, setFormData] = useState<SignUpData>({
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

    if (isTrial && !formData.phone) {
      setError('Phone number is required for trial setup');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUpWithEmail(formData);
      
      if (error) {
        if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
          if (error.message.includes('already registered')) {
            setError('Email is already registered. Try signing in instead.');
          } else {
            setError(error.message);
          }
        } else {
          setError('An error occurred during sign up');
        }
      } else if (data) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred during sign up. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Enhanced background for trial success */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-200/20 rounded-full blur-2xl animate-pulse animation-delay-300"></div>
        </div>
        
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center relative z-10 border border-white/50">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {isTrial ? '🎉 Welcome to Your Free Trial!' : 'Welcome to Spectra!'}
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {isTrial 
              ? 'Your trial account has been created successfully. Get ready to transform your salon!'
              : 'Your account has been created successfully'
            }
          </p>
          {isTrial && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 mb-6 border border-amber-200">
              <p className="text-amber-800 font-semibold text-sm">
                🚀 Your free hardware and installation are being scheduled!
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">Redirecting you to the homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isTrial 
      ? 'bg-gradient-to-br from-emerald-50 via-white to-amber-50' 
      : 'bg-gradient-to-br from-amber-50 via-white to-orange-50'
    } flex items-center justify-center px-4 relative overflow-hidden`}>
      
      {/* Enhanced background for trial mode */}
      {isTrial && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-200/20 rounded-full blur-2xl animate-pulse animation-delay-300"></div>
        </div>
      )}
      
      <div className="max-w-md w-full relative z-10">
        {/* Enhanced Logo Section */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <img 
              src="/base_logo.png" 
              alt="Spectra" 
              className="h-14 mx-auto mb-6 hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h1 className={`text-4xl font-bold ${isTrial 
            ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
            : 'bg-gradient-to-r from-amber-600 to-orange-600'
          } bg-clip-text text-transparent mb-3`}>
            {isTrial ? '🚀 Start Your Free Trial' : 'Join Spectra'}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {isTrial 
              ? 'Create your account and begin your 30-day free trial'
              : 'Create a new account and start using the system'
            }
          </p>
          {isTrial && (
            <div className="mt-6 bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-200 rounded-2xl p-4 animate-fade-in-up">
              <p className="text-emerald-800 font-bold text-lg flex items-center justify-center gap-2">
                <span>🎉</span>
                <span>Special UGC Offer: Free hardware + installation included!</span>
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Sign Up Form */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced form fields with better styling */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-3">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-5 py-4 border-2 ${isTrial ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'} rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-lg`}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                Phone {isTrial && <span className="text-emerald-600 font-bold">*</span>}
                {isTrial && <span className="text-sm text-emerald-600 font-medium ml-2">(Required for trial setup)</span>}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-5 py-4 border-2 ${isTrial ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'} rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-lg`}
                placeholder="+1-555-123-4567"
                required={isTrial}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-5 py-4 border-2 ${isTrial ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'} rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-lg`}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-5 py-4 border-2 ${isTrial ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'} rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-lg`}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Enhanced Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${isTrial 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-emerald-500/25' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
              } text-white font-bold py-5 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isTrial ? 'Starting your trial...' : 'Creating account...'}</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span>{isTrial ? '🚀' : '✨'}</span>
                  <span>{isTrial ? 'Start My Free Trial' : 'Create Account'}</span>
                </span>
              )}
            </Button>
          </form>

          {/* Enhanced Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-lg">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className={`${isTrial ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-600 hover:text-amber-700'} font-semibold hover:underline transition-colors duration-200`}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 leading-relaxed">
            By signing up, you agree to our
            <Link to="/terms" className={`${isTrial ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-600 hover:text-amber-700'} hover:underline mx-1 font-medium`}>Terms of Service</Link>
            and
            <Link to="/privacy" className={`${isTrial ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-600 hover:text-amber-700'} hover:underline mx-1 font-medium`}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 