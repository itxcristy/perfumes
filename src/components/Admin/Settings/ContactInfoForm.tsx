import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';

interface ContactInfo {
  id?: string;
  contact_type: string;
  label: string;
  value: string;
  is_primary: boolean;
  is_active: boolean;
  display_order: number;
  icon_name: string;
  additional_info: any;
}

interface ContactInfoFormProps {
  contact: ContactInfo | null;
  onClose: () => void;
}

const contactTypes = [
  { value: 'phone', label: 'Phone Number', icon: 'Phone' },
  { value: 'email', label: 'Email Address', icon: 'Mail' },
  { value: 'address', label: 'Physical Address', icon: 'MapPin' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { value: 'support', label: 'Support', icon: 'Headphones' },
];

export const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ contact, onClose }) => {
  const [formData, setFormData] = useState<ContactInfo>({
    contact_type: '',
    label: '',
    value: '',
    is_primary: false,
    is_active: true,
    display_order: 0,
    icon_name: '',
    additional_info: {},
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    }
  }, [contact]);

  const handleTypeChange = (type: string) => {
    const selected = contactTypes.find(t => t.value === type);
    if (selected) {
      setFormData({
        ...formData,
        contact_type: type,
        icon_name: selected.icon,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = contact?.id
        ? await apiClient.put(`/admin/settings/contact-info/${contact.id}`, formData)
        : await apiClient.post('/admin/settings/contact-info', formData);

      if (response.success) {
        showSuccess(contact?.id ? 'Contact information updated successfully' : 'Contact information created successfully');
        onClose();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to save contact information');
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
            {contact?.id ? 'Edit Contact Information' : 'Add Contact Information'}
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
          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Type *
            </label>
            <select
              value={formData.contact_type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select a type</option>
              {contactTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Customer Support, Main Office"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.contact_type === 'email' ? 'Email Address' :
               formData.contact_type === 'phone' || formData.contact_type === 'whatsapp' ? 'Phone Number' :
               formData.contact_type === 'address' ? 'Address' : 'Value'} *
            </label>
            {formData.contact_type === 'address' ? (
              <textarea
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                rows={3}
                placeholder="123 Main Street, City, State, ZIP"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            ) : (
              <input
                type={formData.contact_type === 'email' ? 'email' : 'text'}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={
                  formData.contact_type === 'email' ? 'support@example.com' :
                  formData.contact_type === 'phone' || formData.contact_type === 'whatsapp' ? '+1 (555) 123-4567' :
                  'Enter value'
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            )}
          </div>

          {/* Additional Info - Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department (Optional)
            </label>
            <input
              type="text"
              value={formData.additional_info?.department || ''}
              onChange={(e) => setFormData({
                ...formData,
                additional_info: { ...formData.additional_info, department: e.target.value }
              })}
              placeholder="e.g., Sales, Support, General"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Additional Info - Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Hours (Optional)
            </label>
            <input
              type="text"
              value={formData.additional_info?.hours || ''}
              onChange={(e) => setFormData({
                ...formData,
                additional_info: { ...formData.additional_info, hours: e.target.value }
              })}
              placeholder="e.g., Mon-Fri 9AM-6PM"
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

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_primary" className="text-sm font-medium text-gray-700">
                Primary contact (featured prominently)
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
                Active (visible on website)
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
              {loading ? 'Saving...' : contact?.id ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

