import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { apiClient } from '../lib/apiClient';
import { useError } from './ErrorContext';

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

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        if (response.user) {
          setUser(response.user);
          setError(null);
        }
      } catch (error) {
        // User not authenticated, which is fine
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Standard Authentication Methods
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.login(email, password);

      if (response.user) {
        setUser(response.user);
        setError(null);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.register(email, password, fullName);

      if (response.user) {
        setUser(response.user);
        setError(null);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiClient.logout();
      setUser(null);
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('cart_items');
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
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
        userData.name || 'User'
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user is currently authenticated');
      }

      const response = await apiClient.updateProfile(updates);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      setError(message);
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
    throw new Error('Password reset not yet implemented');
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    throw new Error('Password update not yet implemented');
  };

  const resendVerification = async (): Promise<void> => {
    throw new Error('Email verification not yet implemented');
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
    </AuthContext.Provider>
  );
};