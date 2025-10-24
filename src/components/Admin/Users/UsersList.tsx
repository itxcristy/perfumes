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
        <div>
          <p className="font-medium text-gray-900">{user.full_name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      )
    },
    {
      key: 'order_count',
      label: 'Orders',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-600">{user.order_count || 0}</span>
      )
    },
    {
      key: 'total_spent',
      label: 'Total Spent',
      sortable: true,
      render: (user) => (
        <span className="text-sm font-medium text-gray-900">
          ${Number(user.total_spent || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (user) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            user.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Registered',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-600">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleStatus(user)}
            className={`p-1 rounded transition-colors ${
              user.is_active
                ? 'text-orange-600 hover:bg-orange-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={user.is_active ? 'Deactivate' : 'Activate'}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(user)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowDeleteModal(true);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage user accounts</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
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

