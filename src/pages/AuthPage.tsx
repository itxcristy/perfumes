import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User,
  AlertCircle, Loader2, Shield, Store, Users,
  ArrowLeft, Sparkles, Heart, Star, Droplets
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding & Visuals */}
        <div 
          className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl p-10 text-white overflow-hidden relative animate-fade-in-left"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-serif font-bold tracking-wide">Aligarh Attars</h1>
            </div>
            
            <h2 className="text-3xl font-serif font-bold mb-4 leading-tight tracking-tight">
              Experience the Essence of Luxury
            </h2>
            
            <p className="text-white/90 text-base font-serif mb-8 max-w-md leading-relaxed">
              Discover our exquisite collection of premium fragrances, crafted with passion and tradition.
            </p>
          </div>
          
          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/20">
                <Droplets className="h-6 w-6 mb-2" />
                <h3 className="font-serif font-semibold text-sm mb-1">Premium Quality</h3>
                <p className="text-xs text-white/80 font-serif">Authentic ingredients</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/20">
                <Heart className="h-6 w-6 mb-2" />
                <h3 className="font-serif font-semibold text-sm mb-1">Heritage Craft</h3>
                <p className="text-xs text-white/80 font-serif">Traditional methods</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/20">
                <Star className="h-6 w-6 mb-2" />
                <h3 className="font-serif font-semibold text-sm mb-1">Luxury Experience</h3>
                <p className="text-xs text-white/80 font-serif">Unforgettable scents</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Auth Form */}
        <div 
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 animate-fade-in-right"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-serif text-gray-900">Aligarh Attars</h1>
              </div>
              
              <button
                onClick={goHome}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Home
              </button>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-2">
                {mode === 'login' && 'Welcome back'}
                {mode === 'signup' && 'Create account'}
                {mode === 'forgot' && 'Reset password'}
              </h2>
              <p className="text-gray-600 text-sm font-serif">
                {mode === 'login' && 'Sign in to explore our exquisite collection'}
                {mode === 'signup' && `Create your ${getRoleLabel(formData.role).toLowerCase()} account`}
                {mode === 'forgot' && "We'll send you a reset link"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection (Signup) */}
              {mode === 'signup' && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am a
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['customer', 'seller', 'admin'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleInputChange('role', role)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.role === role
                            ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                            : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                        }`}
                      >
                        {getRoleIcon(role)}
                        <span className="text-xs font-medium mt-2">{getRoleLabel(role)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`block w-full pl-12 pr-4 py-3.5 border text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors`}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              {/* Full Name Field (Signup) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`block w-full pl-12 pr-4 py-3.5 border text-sm ${
                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors`}
                      placeholder="John Doe"
                      disabled={loading}
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}
              
              {/* Password Field */}
              {mode !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`block w-full pl-12 pr-12 py-3.5 border text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors`}
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>
              )}
              
              {/* Confirm Password Field (Signup) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`block w-full pl-12 pr-12 py-3.5 border text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors`}
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 focus:outline-none transition-colors"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
              <div className="text-center pt-4">
                {mode === 'login' ? (
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-medium text-purple-600 hover:text-purple-700 focus:outline-none transition-colors"
                      disabled={loading}
                    >
                      Sign up
                    </button>
                  </p>
                ) : mode === 'signup' ? (
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-medium text-purple-600 hover:text-purple-700 focus:outline-none transition-colors"
                      disabled={loading}
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-medium text-purple-600 hover:text-purple-700 focus:outline-none transition-colors"
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
      </div>
    </div>
  );
};

export default AuthPage;