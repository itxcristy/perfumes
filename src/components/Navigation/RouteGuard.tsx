import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, RefreshCw, User, CheckCircle, XCircle } from 'lucide-react';
import { useRouteGuards } from '../../hooks/useEnhancedNavigation';
import { useAuth } from '../../contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
  unauthorizedComponent?: React.ComponentType;
  redirectTo?: string;
  showGuardStatus?: boolean;
}

interface GuardStatusProps {
  status: 'checking' | 'allowed' | 'denied';
  message?: string;
  checks: Array<{
    name: string;
    status: 'pending' | 'passed' | 'failed';
    message?: string;
  }>;
}

const GuardStatus: React.FC<GuardStatusProps> = ({ status, message, checks }) => {
  const getStatusIcon = (checkStatus: string) => {
    switch (checkStatus) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const getOverallIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'allowed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'denied':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50"
    >
      <div className="flex items-center space-x-3 mb-3">
        {getOverallIcon()}
        <div>
          <h3 className="font-medium text-gray-900">Route Guard</h3>
          <p className="text-sm text-gray-600">
            {status === 'checking' && 'Checking permissions...'}
            {status === 'allowed' && 'Access granted'}
            {status === 'denied' && 'Access denied'}
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
          {message}
        </div>
      )}

      <div className="space-y-2">
        {checks.map((check, index) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2 text-sm"
          >
            {getStatusIcon(check.status)}
            <span className={`${
              check.status === 'failed' ? 'text-red-600' : 
              check.status === 'passed' ? 'text-green-600' : 
              'text-gray-600'
            }`}>
              {check.name}
            </span>
            {check.message && (
              <span className="text-xs text-gray-500">({check.message})</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const DefaultLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
      <h2 className="text-lg font-medium text-gray-900 mb-2">Checking Access</h2>
      <p className="text-gray-600">Verifying your permissions...</p>
    </motion.div>
  </div>
);

const DefaultUnauthorizedComponent: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto p-8"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-red-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      
      <p className="text-gray-600 mb-6">
        {message || 'You do not have permission to access this page.'}
      </p>

      <div className="space-y-3">
        <button
          onClick={() => window.history.back()}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </motion.div>
  </div>
);

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiresAuth = false,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackComponent: FallbackComponent,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  unauthorizedComponent: UnauthorizedComponent = DefaultUnauthorizedComponent,
  redirectTo,
  showGuardStatus = process.env.NODE_ENV === 'development'
}) => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { checking, allowed, message } = useRouteGuards();
  
  const [guardChecks, setGuardChecks] = useState<Array<{
    name: string;
    status: 'pending' | 'passed' | 'failed';
    message?: string;
  }>>([]);

  // Initialize guard checks
  useEffect(() => {
    const checks = [];
    
    if (requiresAuth) {
      checks.push({
        name: 'Authentication',
        status: 'pending' as const,
        message: 'Checking if user is logged in'
      });
    }
    
    if (requiredRoles.length > 0) {
      checks.push({
        name: 'Role Authorization',
        status: 'pending' as const,
        message: `Requires: ${requiredRoles.join(', ')}`
      });
    }
    
    if (requiredPermissions.length > 0) {
      checks.push({
        name: 'Permission Check',
        status: 'pending' as const,
        message: `Requires: ${requiredPermissions.join(', ')}`
      });
    }

    setGuardChecks(checks);
  }, [requiresAuth, requiredRoles, requiredPermissions]);

  // Update guard checks based on auth state
  useEffect(() => {
    if (authLoading || checking) return;

    setGuardChecks(prev => prev.map(check => {
      switch (check.name) {
        case 'Authentication':
          return {
            ...check,
            status: user ? 'passed' : 'failed',
            message: user ? 'User authenticated' : 'User not authenticated'
          };
          
        case 'Role Authorization':
          const userRoles = user?.roles || [];
          const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
          return {
            ...check,
            status: hasRequiredRole ? 'passed' : 'failed',
            message: hasRequiredRole 
              ? `Has role: ${requiredRoles.find(role => userRoles.includes(role))}` 
              : `Missing roles: ${requiredRoles.join(', ')}`
          };
          
        case 'Permission Check':
          const userPermissions = user?.permissions || [];
          const hasRequiredPermission = requiredPermissions.some(perm => userPermissions.includes(perm));
          return {
            ...check,
            status: hasRequiredPermission ? 'passed' : 'failed',
            message: hasRequiredPermission 
              ? `Has permission: ${requiredPermissions.find(perm => userPermissions.includes(perm))}` 
              : `Missing permissions: ${requiredPermissions.join(', ')}`
          };
          
        default:
          return check;
      }
    }));
  }, [user, authLoading, checking, requiredRoles, requiredPermissions]);

  // Show loading state
  if (authLoading || checking) {
    return (
      <>
        <LoadingComponent />
        {showGuardStatus && (
          <GuardStatus
            status="checking"
            message="Verifying access permissions..."
            checks={guardChecks}
          />
        )}
      </>
    );
  }

  // Check authentication
  if (requiresAuth && !user) {
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    return (
      <>
        <UnauthorizedComponent message="Please log in to access this page." />
        {showGuardStatus && (
          <GuardStatus
            status="denied"
            message="Authentication required"
            checks={guardChecks}
          />
        )}
      </>
    );
  }

  // Check roles
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      if (redirectTo) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
      }
      
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      return (
        <>
          <UnauthorizedComponent 
            message={`This page requires one of the following roles: ${requiredRoles.join(', ')}`} 
          />
          {showGuardStatus && (
            <GuardStatus
              status="denied"
              message="Insufficient role permissions"
              checks={guardChecks}
            />
          )}
        </>
      );
    }
  }

  // Check permissions
  if (requiredPermissions.length > 0 && user) {
    const userPermissions = user.permissions || [];
    const hasRequiredPermission = requiredPermissions.some(perm => userPermissions.includes(perm));
    
    if (!hasRequiredPermission) {
      if (redirectTo) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
      }
      
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      return (
        <>
          <UnauthorizedComponent 
            message={`This page requires one of the following permissions: ${requiredPermissions.join(', ')}`} 
          />
          {showGuardStatus && (
            <GuardStatus
              status="denied"
              message="Insufficient permissions"
              checks={guardChecks}
            />
          )}
        </>
      );
    }
  }

  // Check global route guards
  if (!allowed) {
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    return (
      <>
        <UnauthorizedComponent message={message} />
        {showGuardStatus && (
          <GuardStatus
            status="denied"
            message={message}
            checks={guardChecks}
          />
        )}
      </>
    );
  }

  // All checks passed, render children
  return (
    <>
      {children}
      {showGuardStatus && (
        <GuardStatus
          status="allowed"
          message="All checks passed"
          checks={guardChecks}
        />
      )}
    </>
  );
};

// Higher-order component for route protection
export const withRouteGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RouteGuardProps, 'children'>
) => {
  return (props: P) => (
    <RouteGuard {...guardProps}>
      <Component {...props} />
    </RouteGuard>
  );
};

// Hook for checking route access programmatically
export const useRouteAccess = (
  requiresAuth?: boolean,
  requiredRoles?: string[],
  requiredPermissions?: string[]
) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    setChecking(true);
    setReason(null);

    // Check authentication
    if (requiresAuth && !user) {
      setHasAccess(false);
      setReason('Authentication required');
      setChecking(false);
      return;
    }

    // Check roles
    if (requiredRoles && requiredRoles.length > 0 && user) {
      const userRoles = user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        setHasAccess(false);
        setReason(`Missing required roles: ${requiredRoles.join(', ')}`);
        setChecking(false);
        return;
      }
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0 && user) {
      const userPermissions = user.permissions || [];
      const hasRequiredPermission = requiredPermissions.some(perm => userPermissions.includes(perm));
      
      if (!hasRequiredPermission) {
        setHasAccess(false);
        setReason(`Missing required permissions: ${requiredPermissions.join(', ')}`);
        setChecking(false);
        return;
      }
    }

    // All checks passed
    setHasAccess(true);
    setChecking(false);
  }, [user, requiresAuth, requiredRoles, requiredPermissions]);

  return { hasAccess, checking, reason };
};
