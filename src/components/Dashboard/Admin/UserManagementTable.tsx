import React from 'react';
import {
  Edit,
  Trash2,
  Mail,
  Key,
  MoreVertical,
  Shield,
  CheckCircle,
  Clock,
  X,
  Send,
  Users
} from 'lucide-react';
import { User } from '../../../types';

interface UserManagementTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onResendConfirmation: (userId: string) => void;
  onConfirmEmail: (userId: string) => void;
  actionLoading: string;
  getStatusBadge: (user: User) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEditUser,
  onDeleteUser,
  onResendConfirmation,
  onConfirmEmail,
  actionLoading,
  getStatusBadge,
  getRoleBadge
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-gray-400">{user.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {!user.emailVerified && (
                      <>
                        <button
                          onClick={() => onResendConfirmation(user.id)}
                          disabled={actionLoading === `confirm-${user.id}`}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Resend confirmation email"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onConfirmEmail(user.id)}
                          disabled={actionLoading === `manual-confirm-${user.id}`}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Manually confirm email"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit user"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      disabled={actionLoading === `delete-${user.id}`}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {users.map((user) => (
          <div key={user.id} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => onSelectUser(user.id)}
                  className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                  <div className="text-sm text-gray-500 truncate">{user.email}</div>
                  {user.phone && (
                    <div className="text-xs text-gray-400">{user.phone}</div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user)}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!user.emailVerified && (
                  <>
                    <button
                      onClick={() => onResendConfirmation(user.id)}
                      disabled={actionLoading === `confirm-${user.id}`}
                      className="p-2 text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      title="Resend confirmation email"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onConfirmEmail(user.id)}
                      disabled={actionLoading === `manual-confirm-${user.id}`}
                      className="p-2 text-green-600 hover:text-green-900 disabled:opacity-50"
                      title="Manually confirm email"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => onEditUser(user)}
                  className="p-2 text-indigo-600 hover:text-indigo-900"
                  title="Edit user"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteUser(user.id)}
                  disabled={actionLoading === `delete-${user.id}`}
                  className="p-2 text-red-600 hover:text-red-900 disabled:opacity-50"
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};
