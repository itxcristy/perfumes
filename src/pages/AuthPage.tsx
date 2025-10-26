import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User,
  AlertCircle, Loader2, Shield, Store, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

type AuthMode = 'login' | 'signup' | 'forgot';
type UserRole = 'customer' | 'seller' | 'admin';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: UserRole;
}

interface FormErrors {
  [key: string]: string;
}

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'customer'
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect to appropriate dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Set mode based on URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get('mode');
    const roleParam = searchParams.get('role') as UserRole;

    if (modeParam === 'signup') {
      setMode('signup');
    } else if (modeParam === 'forgot') {
      setMode('forgot');
    }

    if (roleParam && ['customer', 'seller', 'admin'].includes(roleParam)) {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [location.search]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (mode !== 'forgot' && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode !== 'forgot' && !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Signup specific validations
    if (mode === 'signup') {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        showNotification({
          type: 'success',
          title: 'Welcome back!',
          message: 'Successfully logged in.'
        });

        // Small delay to ensure user context is updated
        setTimeout(() => {
          // Redirect based on user role from context
          if (user?.role === 'admin') {
            navigate('/admin');
          } else if (user?.role === 'seller') {
            navigate('/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 100);
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          role: formData.role
        });
        showNotification({
          type: 'success',
          title: 'Account created!',
          message: 'Account created successfully!'
        });

        // Small delay to ensure user context is updated
        setTimeout(() => {
          // Redirect based on selected role
          if (formData.role === 'admin') {
            navigate('/admin');
          } else if (formData.role === 'seller') {
            navigate('/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 100);
      } else if (mode === 'forgot') {
        // Handle forgot password
        showNotification({
          type: 'success',
          title: 'Password reset sent!',
          message: 'Password reset link sent to your email!'
        });
        setMode('login');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      showNotification({
        type: 'error',
        title: 'Authentication failed',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Get current user to determine role
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      // In a real implementation, you would call an API endpoint to get user info
      // For now, we'll return the user from context
      return user;
    } catch (error) {
      return null;
    }
  };

  // Navigate back to home page
  const goHome = () => {
    navigate('/');
  };

  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="h-5 w-5" />;
      case 'seller': return <Store className="h-5 w-5" />;
      case 'customer': return <Users className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  // Get role label
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'seller': return 'Seller';
      case 'customer': return 'Customer';
      default: return 'Customer';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🌸</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {mode === 'login' && 'Aligarh Attars'}
                {mode === 'signup' && 'Join Aligarh Attars'}
                {mode === 'forgot' && 'Reset Password'}
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                {mode === 'login' && 'Sign in to explore our exquisite collection'}
                {mode === 'signup' && `Create your ${getRoleLabel(formData.role).toLowerCase()} account`}
                {mode === 'forgot' && 'We\'ll send you a reset link'}
              </p>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection (Signup) */}
              {mode === 'signup' && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(['customer', 'seller', 'admin'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleInputChange('role', role)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${formData.role === role
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-amber-200'
                        }`}
                    >
                      {getRoleIcon(role)}
                      <span className="text-xs font-medium mt-1">{getRoleLabel(role)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Full Name Field (Signup) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.fullName ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      placeholder="John Doe"
                      disabled={loading}
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              {/* Password Field */}
              {mode !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              {/* Confirm Password Field (Signup) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Remember Me & Forgot Password (Login) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm font-medium text-amber-600 hover:text-amber-700 focus:outline-none"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : mode === 'login' ? (
                    'Sign In'
                  ) : mode === 'signup' ? (
                    `Create ${getRoleLabel(formData.role)} Account`
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="text-center text-sm text-gray-600">
                {mode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-medium text-amber-600 hover:text-amber-700 focus:outline-none"
                      disabled={loading}
                    >
                      Sign up
                    </button>
                  </p>
                ) : mode === 'signup' ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-medium text-amber-600 hover:text-amber-700 focus:outline-none"
                      disabled={loading}
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p>
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-medium text-amber-600 hover:text-amber-700 focus:outline-none"
                      disabled={loading}
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Home Button */}
        <div className="mt-6 text-center">
          <button
            onClick={goHome}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors focus:outline-none"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;