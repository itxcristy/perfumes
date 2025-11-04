import React, { useEffect, useState, useRef } from 'react';
import { Save, RefreshCw, Upload, X } from 'lucide-react';
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
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Please upload an image smaller than 5MB');
      return;
    }

    try {
      setUploading(key);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;

          // Upload file to backend
          const response = await apiClient.post('/admin/settings/upload', {
            file: base64String
          });

          if (response.success && response.data?.url) {
            // Update the setting with the new URL
            await handleUpdate(key, response.data.url);
            showSuccess('Upload Successful', 'Logo uploaded successfully');
          } else {
            showError('Upload Failed', response.message || 'Failed to upload file');
          }
        } catch (error: any) {
          console.error('Error uploading file:', error);
          showError('Upload Error', error.message || 'Failed to upload file');
        } finally {
          setUploading(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.onerror = () => {
        showError('Read Error', 'Failed to read file');
        setUploading(null);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showError('Upload Error', error.message || 'Failed to upload file');
      setUploading(null);
    }
  };

  // Separate site_name and logo_url for special display
  const siteName = settings.find(s => s.setting_key === 'site_name');
  const logoUrl = settings.find(s => s.setting_key === 'logo_url');
  const otherSettings = settings.filter(s => s.setting_key !== 'site_name' && s.setting_key !== 'logo_url');

  const groupedSettings = otherSettings.reduce((acc, setting) => {
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Site Settings</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Configure general website settings</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
        >
          <RefreshCw className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Site Name and Logo Section */}
      {(siteName || logoUrl) && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Website Identity</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Configure your website name and logo</p>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-200">
            {/* Site Name */}
            {siteName && (
              <div className="p-3 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <label className="font-medium text-xs sm:text-sm text-gray-900">
                        Website Name
                      </label>
                      {siteName.is_public && (
                        <span className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    {siteName.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{siteName.description}</p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={siteName.setting_value}
                        onChange={(e) => handleChange(siteName.setting_key, e.target.value)}
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                      />
                      <button
                        onClick={() => handleUpdate(siteName.setting_key, siteName.setting_value)}
                        disabled={saving === siteName.setting_key}
                        className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex-shrink-0"
                      >
                        {saving === siteName.setting_key ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                            <span className="hidden sm:inline">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Upload */}
            {logoUrl && (
              <div className="p-3 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <label className="font-medium text-xs sm:text-sm text-gray-900">
                        Website Logo
                      </label>
                      {logoUrl.is_public && (
                        <span className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    {logoUrl.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{logoUrl.description}</p>
                    )}

                    <div className="flex-1 flex flex-col gap-3">
                      {logoUrl.setting_value && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <img
                            src={logoUrl.setting_value}
                            alt="Logo preview"
                            className="h-12 w-12 object-contain rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{logoUrl.setting_value}</p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, logoUrl.setting_key)}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading === logoUrl.setting_key}
                        className="px-3 sm:px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 active:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                      >
                        {uploading === logoUrl.setting_key ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                            <span className="hidden sm:inline">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Upload Logo</span>
                            <span className="sm:hidden">Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings by Category */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedSettings).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Category Header */}
            <div className="bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200">
              <h3 className="font-semibold text-xs sm:text-base text-gray-900 capitalize">{category}</h3>
            </div>

            {/* Settings */}
            <div className="divide-y divide-gray-200">
              {items.map((setting) => (
                <div key={setting.id} className="p-3 sm:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <label className="font-medium text-xs sm:text-sm text-gray-900">
                          {formatKey(setting.setting_key)}
                        </label>
                        {setting.is_public && (
                          <span className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{setting.description}</p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {setting.setting_key === 'logo_url' ? (
                          <>
                            <div className="flex-1 flex flex-col gap-3">
                              {setting.setting_value && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <img
                                    src={setting.setting_value}
                                    alt="Logo preview"
                                    className="h-12 w-12 object-contain rounded"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">{setting.setting_value}</p>
                                  </div>
                                </div>
                              )}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, setting.setting_key)}
                                className="hidden"
                              />
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading === setting.setting_key}
                                className="px-3 sm:px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 active:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                              >
                                {uploading === setting.setting_key ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                                    <span className="hidden sm:inline">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">Upload Logo</span>
                                    <span className="sm:hidden">Upload</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        ) : setting.setting_type === 'boolean' ? (
                          <select
                            value={setting.setting_value}
                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : setting.setting_type === 'number' ? (
                          <input
                            type="number"
                            value={setting.setting_value}
                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                          />
                        ) : (
                          <input
                            type="text"
                            value={setting.setting_value}
                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                          />
                        )}

                        {setting.setting_key !== 'logo_url' && (
                          <button
                            onClick={() => handleUpdate(setting.setting_key, setting.setting_value)}
                            disabled={saving === setting.setting_key}
                            className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex-shrink-0"
                          >
                            {saving === setting.setting_key ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                                <span className="hidden sm:inline">Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Save</span>
                              </>
                            )}
                          </button>
                        )}
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

