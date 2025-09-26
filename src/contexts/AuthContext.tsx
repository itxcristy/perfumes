import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { supabase, getProfileForUser } from '../lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useError } from './ErrorContext';
import { NewUserService } from '../lib/services/NewUserService'; // Import new service

import { MobileAuthView } from '../components/Auth/MobileAuthView';

// Initialize the new user service
const userService = new NewUserService();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileAuthOpen, setIsMobileAuthOpen] = useState(false);
  const [mobileAuthMode, setMobileAuthMode] = useState<'login' | 'signup' | 'profile'>('login');
  const { setError } = useError();

  // Initialize auth state with better error handling
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Add timeout for session retrieval
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session retrieval timed out')), 15000);
        });

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (session?.user) {
          await handleUserSession(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);

        // In case of timeout or connection issues, try direct login mode
        if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
          console.log('Falling back to direct login mode due to auth initialization error');
          const directLoginRole = import.meta.env.VITE_DIRECT_LOGIN_DEFAULT_ROLE || 'admin';
          const tempUser: User = {
            id: 'direct-login-user',
            email: 'admin@sufiessences.com',
            name: 'Direct Login User',
            role: directLoginRole as 'admin' | 'seller' | 'customer',
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
          };
          setUser(tempUser);
          setError(null);
        } else {
          setError('Authentication initialization failed. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle auth state changes with better error handling
  useEffect(() => {
    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      try {
        setLoading(true);

        if (session?.user) {
          await handleUserSession(session.user);
        } else {
          setUser(null);
          setError(null);
          // Clear any stored user data
          localStorage.removeItem('user_preferences');
          localStorage.removeItem('cart_items');
        }
      } catch (error) {
        console.error('Auth state change error:', error);

        // If there's an error during auth state change, fall back to direct login if enabled
        if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true' && session?.user) {
          console.log('Falling back to direct login mode due to auth state change error');
          const directLoginRole = import.meta.env.VITE_DIRECT_LOGIN_DEFAULT_ROLE || 'admin';
          const tempUser: User = {
            id: session.user.id || 'direct-login-user',
            email: session.user.email || 'admin@sufiessences.com',
            name: 'Direct Login User',
            role: directLoginRole as 'admin' | 'seller' | 'customer',
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
          };
          setUser(tempUser);
          setError(null);
        } else {
          setError('Authentication error occurred. Please try refreshing the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => subscription?.unsubscribe();
  }, []);

  const handleUserSession = async (authUser: any) => {
    try {
      // Use the new service to get user profile
      const profileData = await userService.getUserById(authUser.id);

      if (profileData) {
        const fullUser: User = {
          ...profileData,
          email: authUser.email!,
        };
        setUser(fullUser);
        setError(null);
      } else {
        // Create profile if it doesn't exist using the new service
        const newProfile = await userService.createUser({
          email: authUser.email!,
          name: authUser.user_metadata?.full_name || '',
          role: authUser.user_metadata?.role || 'customer',
          phone: authUser.user_metadata?.phone || '',
          dateOfBirth: authUser.user_metadata?.date_of_birth || '',
          isActive: true
        });

        if (newProfile) {
          setUser(newProfile);
        } else {
          setUser(null);
          setError('Failed to create user profile');
        }
      }
    } catch (err) {
      console.error('Session handling error:', err);
      // Fallback for direct login mode when RLS policies aren't set up
      if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
        console.log('Direct login mode: Creating temporary user profile');
        const directLoginRole = import.meta.env.VITE_DIRECT_LOGIN_DEFAULT_ROLE || 'admin';
        const tempUser: User = {
          id: authUser.id || 'direct-login-user',
          email: authUser.email || 'admin@sufiessences.com',
          name: 'Direct Login User',
          role: directLoginRole as 'admin' | 'seller' | 'customer',
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
        };
        setUser(tempUser);
        setError(null);
        return;
      }
      setError(err instanceof Error ? err.message : 'Authentication error');
      setUser(null);
    }
  };

  // Standard Authentication Methods with timeout handling
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Add timeout wrapper for auth requests
      const authPromise = supabase.auth.signInWithPassword({ email, password });

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication request timed out')), 15000);
      });

      // Race between auth and timeout
      const { error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid credentials. Please check your email and password.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        } else if (error.message.includes('Account is temporarily locked')) {
          throw new Error('Account is temporarily locked due to too many failed attempts. Please try again later.');
        } else if (error.message.includes('timed out') || error.message.includes('aborted')) {
          throw new Error('Connection timeout. Please check your internet connection and try again.');
        } else {
          throw new Error(error.message);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('timed out') || error.message.includes('aborted')) {
          throw new Error('Connection timeout. Please check your internet connection and try again.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred during sign in.');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    additionalData?: Record<string, unknown>
  ): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: additionalData?.fullName || '',
          phone: additionalData?.phone || '',
          date_of_birth: additionalData?.dateOfBirth || '',
          subscribe_newsletter: additionalData?.subscribeNewsletter || false,
          role: 'customer' // Default role for new users
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Send welcome email after successful registration
    try {
      const { emailService } = await import('../services/emailService');
      await emailService.sendWelcomeEmail({
        email: email,
        name: (additionalData?.fullName as string) || 'Customer'
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }

    // Clear user data
    setUser(null);
    localStorage.removeItem('user_preferences');
    localStorage.removeItem('cart_items');
  };

  const logout = async () => {
    await signOut();
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      await signIn(email, password);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Login failed';
    }
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      await signUp(
        userData.email!,
        userData.password!,
        {
          fullName: userData.name,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth
        }
      );
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Add a method to update user profile using the new service
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user is currently authenticated');
      }

      const updatedUser = await userService.updateUser(user.id, updates);
      // Update the user state
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Mobile Authentication Methods
  const openMobileAuth = (mode: 'login' | 'signup' | 'profile' = 'login') => {
    setMobileAuthMode(mode);
    setIsMobileAuthOpen(true);
  };

  const closeMobileAuth = () => {
    setIsMobileAuthOpen(false);
  };

  // Placeholder methods for required interface methods
  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const resendVerification = async (): Promise<void> => {
    if (!user?.email) throw new Error('No email available');
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) throw new Error(error.message);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification,
    updateProfile, // Add the new updateProfile method

    openMobileAuth,
    closeMobileAuth,
    isMobileAuthOpen,
    mobileAuthMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <MobileAuthView
        isOpen={isMobileAuthOpen}
        onClose={() => setIsMobileAuthOpen(false)}
        initialMode={mobileAuthMode === 'profile' ? 'login' : mobileAuthMode}
      />
    </AuthContext.Provider>
  );
};