import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, UserPlus, Search, Filter, Download, Edit, X, CheckCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, useViewport, usePWAInstall } from '../../Common/ResponsiveContainer';
import { useSecurity } from '../../Security/SecurityProvider';
import { validateUser, validateEmail, sanitizeInput } from '../../../utils/validation';
import {
  getAllUsers,
  deleteUsersBulk,
  updateUsersBulk,
  resendConfirmationEmail,
  confirmUserEmail
} from '../../../lib/supabase';
import { createUser, updateUser, deleteUser } from '../../../lib/crudOperations';
import { User } from '../../../types';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { useNotification } from '../../../contexts/NotificationContext';
import { EnhancedButton } from '../../Common/EnhancedButton';
import { Modal } from '../../Common/Modal';
import { UserManagementTable } from './UserManagementTable';
import { UserFormModal } from './UserFormModal';

interface UserFormData {
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'customer';
  phone: string;
  dateOfBirth: string;
  isActive: boolean;
  sendEmail: boolean;
}

interface FilterState {
  search: string;
  role: 'all' | 'admin' | 'seller' | 'customer';
  status: 'all' | 'active' | 'inactive' | 'unverified';
  sortBy: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

const ProductionUserManagement: React.FC = () => {
  // Responsive and PWA hooks
  const viewport = useViewport();
  const { isInstallable, installPWA } = usePWAInstall();

  // Security hooks
  const { checkPermission, logSecurityEvent, rateLimitStatus } = useSecurity();

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string>('');

  // Filter and search state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'customer',
    phone: '',
    dateOfBirth: '',
    isActive: true,
    sendEmail: true
  });

  const { showNotification } = useNotification();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!user.name.toLowerCase().includes(searchLower) &&
          !user.email.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Role filter
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        switch (filters.status) {
          case 'active':
            return user.isActive === true;
          case 'inactive':
            return user.isActive === false;
          case 'unverified':
            return user.emailVerified === false;
        }
      }

      return true;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, filters]);

  // Load users function
  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'customer',
      phone: '',
      dateOfBirth: '',
      isActive: true,
      sendEmail: true
    });
    setGeneratedPassword('');
    setShowPassword(false);
  };

  // Handle create user
  const handleCreateUser = async () => {
    // Security checks
    if (!checkPermission('create', 'user_management')) {
      return;
    }

    if (!rateLimitStatus.userCreation) {
      showNotification({
        type: 'error',
        title: 'Rate Limit Exceeded',
        message: 'Please wait before creating another user.'
      });
      return;
    }

    // Validate input data
    const validationResult = validateUser({
      email: sanitizeInput(formData.email),
      name: sanitizeInput(formData.name),
      role: formData.role,
      phone: formData.phone ? sanitizeInput(formData.phone) : undefined,
      dateOfBirth: formData.dateOfBirth
    });

    if (!validationResult.isValid) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: validationResult.errors.join(', ')
      });
      return;
    }

    // Show warnings if any
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      showNotification({
        type: 'warning',
        title: 'Validation Warnings',
        message: validationResult.warnings.join(', ')
      });
    }

    try {
      setActionLoading('create');
      const result = await createNewUser({
        email: sanitizeInput(formData.email),
        name: sanitizeInput(formData.name),
        role: formData.role,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        isActive: formData.isActive,
        sendEmail: formData.sendEmail
      });

      if (result.success && result.user) {
        setUsers([...users, result.user]);
        setIsCreateModalOpen(false);
        resetForm();

        if (result.password) {
          setGeneratedPassword(result.password);
          setShowPassword(true);
        }

        showNotification({
          type: 'success',
          title: 'User Created',
          message: `User has been created successfully${formData.sendEmail ? ' and confirmation email sent' : ''}.`
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to create user.'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create user. Please try again later.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!currentUser) return;

    // Security checks
    if (!checkPermission('update', 'user_management')) {
      return;
    }

    // Validate input data
    const validationResult = validateUser({
      email: sanitizeInput(formData.email),
      name: sanitizeInput(formData.name),
      role: formData.role,
      phone: formData.phone ? sanitizeInput(formData.phone) : undefined,
      dateOfBirth: formData.dateOfBirth
    });

    if (!validationResult.isValid) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: validationResult.errors.join(', ')
      });
      return;
    }

    try {
      setActionLoading('update');
      const result = await updateUser(currentUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        isActive: formData.isActive
      });

      if (result.success && result.user) {
        setUsers(users.map(u => u.id === currentUser.id ? result.user! : u));
        setIsEditModalOpen(false);
        resetForm();
        setCurrentUser(null);
        showNotification({
          type: 'success',
          title: 'User Updated',
          message: 'User has been updated successfully.'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update user.'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user. Please try again later.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(`delete-${userId}`);
      const result = await deleteUser(userId);

      if (result.success) {
        setUsers(users.filter(u => u.id !== userId));
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
        showNotification({
          type: 'success',
          title: 'User Deleted',
          message: 'User has been deleted successfully.'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to delete user.'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete user. Please try again later.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle resend confirmation
  const handleResendConfirmation = async (userId: string) => {
    try {
      setActionLoading(`confirm-${userId}`);
      const result = await resendConfirmationEmail(userId);

      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Email Sent',
          message: 'Confirmation email has been sent successfully.'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to send confirmation email.'
        });
      }
    } catch (error) {
      console.error('Error sending confirmation:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send confirmation email.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle manual email confirmation
  const handleConfirmEmail = async (userId: string) => {
    try {
      setActionLoading(`manual-confirm-${userId}`);
      const result = await confirmUserEmail(userId);

      if (result.success) {
        // Update user in local state
        setUsers(users.map(u =>
          u.id === userId ? { ...u, emailVerified: true } : u
        ));

        showNotification({
          type: 'success',
          title: 'Email Confirmed',
          message: 'User email has been confirmed successfully.'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to confirm email.'
        });
      }
    } catch (error) {
      console.error('Error confirming email:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to confirm email.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      showNotification({
        type: 'warning',
        title: 'No Users Selected',
        message: 'Please select users to delete.'
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading('bulk-delete');
      const result = await deleteUsersBulk(selectedUsers);

      if (result.success) {
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
        showNotification({
          type: 'success',
          title: 'Users Deleted',
          message: `${selectedUsers.length} users have been deleted successfully.`
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to delete users.'
        });
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete users. Please try again later.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle bulk role update
  const handleBulkRoleUpdate = async (newRole: 'admin' | 'seller' | 'customer') => {
    if (selectedUsers.length === 0) {
      showNotification({
        type: 'warning',
        title: 'No Users Selected',
        message: 'Please select users to update.'
      });
      return;
    }

    try {
      setActionLoading('bulk-role');
      const result = await updateUsersBulk(selectedUsers, { role: newRole });

      if (result.success) {
        setUsers(users.map(u =>
          selectedUsers.includes(u.id) ? { ...u, role: newRole } : u
        ));
        setSelectedUsers([]);
        showNotification({
          type: 'success',
          title: 'Roles Updated',
          message: `${selectedUsers.length} users have been updated to ${newRole} role.`
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update user roles.'
        });
      }
    } catch (error) {
      console.error('Error bulk updating roles:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user roles. Please try again later.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedUsers.length === 0) {
      showNotification({
        type: 'warning',
        title: 'No Users Selected',
        message: 'Please select users to update.'
      });
      return;
    }

    try {
      setActionLoading('bulk-status');
      const result = await updateUsersBulk(selectedUsers, { isActive });

      if (result.success) {
        setUsers(users.map(u =>
          selectedUsers.includes(u.id) ? { ...u, isActive } : u
        ));
        setSelectedUsers([]);
        showNotification({
          type: 'success',
          title: 'Status Updated',
          message: `${selectedUsers.length} users have been ${isActive ? 'activated' : 'deactivated'}.`
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update user status.'
        });
      }
    } catch (error) {
      console.error('Error bulk updating status:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user status. Please try again later.'
      });
    } finally {
      setActionLoading('');
    }
  };

  // Export users to CSV
  const handleExportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Phone', 'Status', 'Email Verified', 'Created At'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.phone || '',
        user.isActive ? 'Active' : 'Inactive',
        user.emailVerified ? 'Yes' : 'No',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification({
      type: 'success',
      title: 'Export Complete',
      message: 'Users have been exported to CSV successfully.'
    });
  };

  // Handle select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      isActive: user.isActive || true,
      sendEmail: false
    });
    setIsEditModalOpen(true);
  };

  // Get status badge
  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }

    if (!user.emailVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Unverified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      seller: 'bg-blue-100 text-blue-800',
      customer: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ResponsiveContainer
      className="user-management-container"
      enablePWASupport={true}
      showMobileMenu={viewport.isMobile}
    >
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* PWA Install Banner */}
        {isInstallable && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-indigo-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-indigo-900">Install App</h3>
                  <p className="text-sm text-indigo-700">Get the full experience with our mobile app</p>
                </div>
              </div>
              <button
                onClick={installPWA}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Install
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between user-management-header">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center user-management-title">
              <Users className="w-8 h-8 mr-3 text-indigo-600" />
              User Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage users, roles, and permissions across your platform
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <EnhancedButton
              onClick={handleExportUsers}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </EnhancedButton>
            <EnhancedButton
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </EnhancedButton>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="seller">Seller</option>
              <option value="customer">Customer</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="unverified">Unverified</option>
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </select>
              <button
                onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm font-medium text-indigo-900">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBulkRoleUpdate('admin')}
                    disabled={actionLoading === 'bulk-role'}
                    className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 disabled:opacity-50"
                  >
                    Make Admin
                  </button>
                  <button
                    onClick={() => handleBulkRoleUpdate('seller')}
                    disabled={actionLoading === 'bulk-role'}
                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 disabled:opacity-50"
                  >
                    Make Seller
                  </button>
                  <button
                    onClick={() => handleBulkRoleUpdate('customer')}
                    disabled={actionLoading === 'bulk-role'}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
                  >
                    Make Customer
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate(true)}
                    disabled={actionLoading === 'bulk-status'}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate(false)}
                    disabled={actionLoading === 'bulk-status'}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={actionLoading === 'bulk-delete'}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <UserManagementTable
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectUser={(userId) => {
            if (selectedUsers.includes(userId)) {
              setSelectedUsers(selectedUsers.filter(id => id !== userId));
            } else {
              setSelectedUsers([...selectedUsers, userId]);
            }
          }}
          onSelectAll={handleSelectAll}
          onEditUser={openEditModal}
          onDeleteUser={handleDeleteUser}
          onResendConfirmation={handleResendConfirmation}
          onConfirmEmail={handleConfirmEmail}
          actionLoading={actionLoading}
          getStatusBadge={getStatusBadge}
          getRoleBadge={getRoleBadge}
        />

        {/* Create User Modal */}
        <UserFormModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
          onSubmit={handleCreateUser}
          formData={formData}
          setFormData={setFormData}
          isEdit={false}
          loading={actionLoading === 'create'}
          generatedPassword={generatedPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        {/* Edit User Modal */}
        <UserFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentUser(null);
            resetForm();
          }}
          onSubmit={handleUpdateUser}
          formData={formData}
          setFormData={setFormData}
          isEdit={true}
          loading={actionLoading === 'update'}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </div>
    </ResponsiveContainer>
  );
};

export default ProductionUserManagement;
