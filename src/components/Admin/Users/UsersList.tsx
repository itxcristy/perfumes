import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Power } from 'lucide-react';
import { DataTable, Column } from '../../Common/DataTable';
import { ConfirmModal } from '../../Common/Modal';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { UserForm } from './UserForm';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  order_count: number;
  total_spent: string;
}

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await apiClient.get(`/admin/users?${params}`);

      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      await apiClient.delete(`/admin/users/${selectedUser.id}`);
      showSuccess('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      showError(error.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await apiClient.patch(`/admin/users/${user.id}/toggle-status`);
      showSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      showError(error.message || 'Failed to update user status');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowFormModal(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      seller: 'bg-blue-100 text-blue-800',
      customer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<User>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (user) => (
        <div className="min-w-0">
          <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{user.full_name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      )
    },
    {
      key: 'order_count',
      label: 'Orders',
      sortable: true,
      render: (user) => (
        <span className="text-xs sm:text-sm text-gray-600">{user.order_count || 0}</span>
      )
    },
    {
      key: 'total_spent',
      label: 'Spent',
      sortable: true,
      render: (user) => (
        <span className="text-xs sm:text-sm font-medium text-gray-900">
          ₹{Number(user.total_spent || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (user) => (
        <span
          className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${user.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (user) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleToggleStatus(user)}
            className={`p-1.5 sm:p-2 rounded transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center ${user.is_active
              ? 'text-orange-600 hover:bg-orange-50 active:bg-orange-100'
              : 'text-green-600 hover:bg-green-50 active:bg-green-100'
              }`}
            title={user.is_active ? 'Deactivate' : 'Activate'}
            aria-label={user.is_active ? 'Deactivate user' : 'Activate user'}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(user)}
            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
            title="Edit"
            aria-label="Edit user"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowDeleteModal(true);
            }}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
            title="Delete"
            aria-label="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">Manage user accounts</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-auto flex-shrink-0"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('');
              setStatusFilter('');
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems,
          onPageChange: setCurrentPage
        }}
        emptyMessage="No users found"
      />

      {/* User Form Modal */}
      {showFormModal && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowFormModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.full_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

