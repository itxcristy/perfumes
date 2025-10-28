import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';

interface SocialMediaAccount {
  id?: string;
  platform: string;
  platform_name: string;
  url: string;
  username: string;
  icon_name: string;
  is_active: boolean;
  display_order: number;
  follower_count: number;
  description: string;
}

interface SocialMediaFormProps {
  account: SocialMediaAccount | null;
  onClose: () => void;
}

const platformOptions = [
  { value: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { value: 'twitter', label: 'Twitter', icon: 'Twitter' },
  { value: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { value: 'pinterest', label: 'Pinterest', icon: 'Pin' },
  { value: 'tiktok', label: 'TikTok', icon: 'Music' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { value: 'telegram', label: 'Telegram', icon: 'Send' },
  { value: 'snapchat', label: 'Snapchat', icon: 'Camera' },
];

export const SocialMediaForm: React.FC<SocialMediaFormProps> = ({ account, onClose }) => {
  const [formData, setFormData] = useState<SocialMediaAccount>({
    platform: '',
    platform_name: '',
    url: '',
    username: '',
    icon_name: '',
    is_active: true,
    display_order: 0,
    follower_count: 0,
    description: '', // Ensure this is always a string
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (account) {
      setFormData({
        ...account,
        description: account.description || '' // Ensure description is always a string
      });
    }
  }, [account]);

  const handlePlatformChange = (platform: string) => {
    const selected = platformOptions.find(p => p.value === platform);
    if (selected) {
      setFormData({
        ...formData,
        platform,
        platform_name: selected.label,
        icon_name: selected.icon,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = account?.id
        ? await apiClient.put(`/admin/settings/social-media/${account.id}`, formData)
        : await apiClient.post('/admin/settings/social-media', formData);

      if (response.success) {
        showSuccess(
          account?.id ? 'Social Media Account Updated' : 'Social Media Account Created',
          account?.id ? 'Social media account updated successfully' : 'Social media account created successfully'
        );
        onClose();
      }
    } catch (error: any) {
      showError('Error Saving Account', error.message || 'Failed to save social media account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {account?.id ? 'Edit Social Media Account' : 'Add Social Media Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform *
            </label>
            <select
              value={formData.platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select a platform</option>
              {platformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="@yourhandle"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Follower Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follower Count
            </label>
            <input
              type="number"
              value={formData.follower_count}
              onChange={(e) => setFormData({ ...formData, follower_count: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Optional description or notes"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active (visible on website)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : account?.id ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

