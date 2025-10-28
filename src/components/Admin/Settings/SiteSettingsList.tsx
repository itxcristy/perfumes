import React, { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  category: string;
  description: string;
  is_public: boolean;
}

export const SiteSettingsList: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('Fetching site settings...');
      const response = await apiClient.get('/admin/settings/site-settings');
      console.log('Site settings response:', response);

      if (response.success) {
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching site settings:', error);
      showError('Error Fetching Settings', error.message || 'Failed to fetch site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      setSaving(key);
      console.log('Updating site setting:', { key, value });
      const response = await apiClient.put(`/admin/settings/site-settings/${key}`, {
        setting_value: value
      });
      console.log('Update response:', response);

      if (response.success) {
        showSuccess('Setting Updated', 'Setting updated successfully');
        fetchSettings();
      }
    } catch (error: any) {
      console.error('Error updating site setting:', error);
      showError('Error Updating Setting', error.message || 'Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(settings.map(s =>
      s.setting_key === key ? { ...s, setting_value: value } : s
    ));
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category]?.push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure general website settings</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Settings by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSettings).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Category Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 capitalize">{category}</h3>
            </div>

            {/* Settings */}
            <div className="divide-y divide-gray-200">
              {items.map((setting) => (
                <div key={setting.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="font-medium text-gray-900">
                          {formatKey(setting.setting_key)}
                        </label>
                        {setting.is_public && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                      )}

                      <div className="flex items-center gap-2">
                        {setting.setting_type === 'boolean' ? (
                          <select
                            value={setting.setting_value}
                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : setting.setting_type === 'number' ? (
                          <input
                            type="number"
                            value={setting.setting_value}
                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        ) : (
                          <input
                            type="text"
                            value={setting.setting_value}
                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        )}

                        <button
                          onClick={() => handleUpdate(setting.setting_key, setting.setting_value)}
                          disabled={saving === setting.setting_key}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {saving === setting.setting_key ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {settings.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Settings Found</h3>
          <p className="text-gray-600">Site settings will appear here once configured</p>
        </div>
      )}
    </div>
  );
};

// Helper function to format setting keys
function formatKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

