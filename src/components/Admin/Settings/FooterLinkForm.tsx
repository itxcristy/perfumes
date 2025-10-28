import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';

interface FooterLink {
  id?: string;
  section_name: string;
  link_text: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
  opens_new_tab: boolean;
}

interface FooterLinkFormProps {
  link: FooterLink | null;
  onClose: () => void;
}

const sectionOptions = [
  'Shop',
  'Customer Care',
  'Company',
  'Legal',
  'Resources',
  'Support',
];

export const FooterLinkForm: React.FC<FooterLinkFormProps> = ({ link, onClose }) => {
  const [formData, setFormData] = useState<FooterLink>({
    section_name: '',
    link_text: '',
    link_url: '',
    display_order: 0,
    is_active: true,
    opens_new_tab: false,
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (link) {
      setFormData(link);
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = link?.id
        ? await apiClient.put(`/admin/settings/footer-links/${link.id}`, formData)
        : await apiClient.post('/admin/settings/footer-links', formData);

      if (response.success) {
        showSuccess(link?.id ? 'Footer link updated successfully' : 'Footer link created successfully');
        onClose();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to save footer link');
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
            {link?.id ? 'Edit Footer Link' : 'Add Footer Link'}
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
          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section *
            </label>
            <select
              value={formData.section_name}
              onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select a section</option>
              {sectionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Or type a custom section name</p>
          </div>

          {/* Link Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Text *
            </label>
            <input
              type="text"
              value={formData.link_text}
              onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
              placeholder="e.g., About Us, Contact, Privacy Policy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link URL *
            </label>
            <input
              type="text"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="/about or https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Use relative paths (e.g., /about) or full URLs</p>
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
            <p className="text-sm text-gray-500 mt-1">Lower numbers appear first within the section</p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="opens_new_tab"
                checked={formData.opens_new_tab}
                onChange={(e) => setFormData({ ...formData, opens_new_tab: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="opens_new_tab" className="text-sm font-medium text-gray-700">
                Open in new tab
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (visible in footer)
              </label>
            </div>
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
              {loading ? 'Saving...' : link?.id ? 'Update Link' : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

