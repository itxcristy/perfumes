import React from 'react';
import { X, Eye, EyeOff, Mail, User, Phone, Calendar, Shield } from 'lucide-react';
import { Modal } from '../../Common/Modal';
import { EnhancedButton } from '../../Common/EnhancedButton';

interface UserFormData {
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'customer';
  phone: string;
  dateOfBirth: string;
  isActive: boolean;
  sendEmail: boolean;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  isEdit: boolean;
  loading: boolean;
  generatedPassword?: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
  loading,
  generatedPassword,
  showPassword,
  setShowPassword
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit User' : 'Create New User'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-indigo-600" />
            Basic Information
          </h3>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Role and Permissions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            Role & Permissions
          </h3>
          
          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              User Role *
            </label>
            <select
              id="role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Administrator</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.role === 'admin' && 'Full access to all platform features and settings'}
              {formData.role === 'seller' && 'Can manage products, orders, and customer interactions'}
              {formData.role === 'customer' && 'Can browse products, place orders, and manage account'}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Account is active
            </label>
          </div>
        </div>

        {/* Email Settings */}
        {!isEdit && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-indigo-600" />
              Email Settings
            </h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">
                Send welcome email with login credentials
              </label>
            </div>
            
            {formData.sendEmail && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Email will include:</strong>
                </p>
                <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                  <li>Welcome message and account details</li>
                  <li>Temporary password for first login</li>
                  <li>Email confirmation link (if required)</li>
                  <li>Instructions for getting started</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Generated Password Display */}
        {generatedPassword && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Generated Password</h3>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Temporary password for {formData.name}:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono">
                      {showPassword ? generatedPassword : '••••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-green-600 hover:text-green-800"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-green-700">
                Make sure to securely share this password with the user. They should change it after first login.
              </p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
          <EnhancedButton
            type="button"
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Cancel
          </EnhancedButton>
          <EnhancedButton
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full sm:w-auto"
          >
            {isEdit ? 'Update User' : 'Create User'}
          </EnhancedButton>
        </div>
      </form>
    </Modal>
  );
};
