import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Zap, Monitor, Sun, Contrast, RotateCcw, Download, Eye, Settings, Layout, Smartphone, Tablet } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsiveDesign } from '../../../utils/responsiveDesign';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveGridItem } from '../../Layout/ResponsiveLayout';

interface ThemeCustomizationDashboardProps {
  className?: string;
}

interface ThemePreview {
  name: string;
  description: string;
  preview: React.ReactNode;
}

export const ThemeCustomizationDashboard: React.FC<ThemeCustomizationDashboardProps> = ({
  className = ''
}) => {
  const {
    themeConfig,
    preferences,
    systemPreferences,
    setMode,
    setColorScheme,
    setFontScale,
    setBorderRadius,
    setAnimationLevel,
    toggleHighContrast,
    toggleReducedMotion,
    resetToDefaults
  } = useTheme();

  const { deviceType, breakpoint } = useResponsiveDesign();
  const [selectedTab, setSelectedTab] = useState<'appearance' | 'typography' | 'layout' | 'accessibility' | 'preview'>('appearance');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Theme mode options - only light mode supported
  const themeModes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Clean and bright interface - only mode available' }
  ];

  // Color scheme options
  const colorSchemes = [
    { value: 'neutral', label: 'Neutral', colors: ['#475569', '#78716c'], description: 'Professional and timeless' },
    { value: 'warm', label: 'Warm', colors: ['#ea580c', '#eab308'], description: 'Inviting and energetic' },
    { value: 'cool', label: 'Cool', colors: ['#3b82f6', '#14b8a6'], description: 'Calm and trustworthy' },
    { value: 'vibrant', label: 'Vibrant', colors: ['#a855f7', '#ef4444'], description: 'Bold and creative' },
    { value: 'monochrome', label: 'Monochrome', colors: ['#6b7280', '#4b5563'], description: 'Minimal and focused' }
  ];

  // Font scale options
  const fontScales = [
    { value: 'compact', label: 'Compact', description: 'More content, smaller text' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced readability' },
    { value: 'spacious', label: 'Spacious', description: 'Larger text, easier reading' }
  ];

  // Border radius options
  const borderRadiusOptions = [
    { value: 'none', label: 'None', description: 'Sharp, modern edges' },
    { value: 'small', label: 'Small', description: 'Subtle rounded corners' },
    { value: 'medium', label: 'Medium', description: 'Balanced roundness' },
    { value: 'large', label: 'Large', description: 'Soft, friendly curves' },
    { value: 'full', label: 'Full', description: 'Pill-shaped elements' }
  ];

  // Animation level options
  const animationLevels = [
    { value: 'none', label: 'None', description: 'No animations' },
    { value: 'reduced', label: 'Reduced', description: 'Minimal animations' },
    { value: 'normal', label: 'Normal', description: 'Standard animations' },
    { value: 'enhanced', label: 'Enhanced', description: 'Rich animations' }
  ];

  // Generate theme previews
  const themePreviews = useMemo((): ThemePreview[] => [
    {
      name: 'Dashboard Cards',
      description: 'How dashboard components will look',
      preview: (
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Total Users</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">12,345</div>
            <div className="text-sm text-green-600">+12% from last month</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">John Doe</div>
                <div className="text-sm text-gray-600">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Form Elements',
      description: 'Input fields and buttons',
      preview: (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Primary
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Secondary
            </button>
          </div>
        </div>
      )
    },
    {
      name: 'Navigation',
      description: 'Menu and navigation elements',
      preview: (
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <div className="w-5 h-5 bg-blue-600 rounded"></div>
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
            <span>Users</span>
          </div>
          <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
            <span>Settings</span>
          </div>
        </div>
      )
    }
  ], []);

  // Export theme configuration
  const exportTheme = () => {
    const themeData = {
      preferences,
      themeConfig,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${themeConfig.colorScheme}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ResponsiveContainer className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Theme Customization</h2>
            <p className="text-gray-600">Customize the appearance and behavior of your dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportTheme}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={resetToDefaults}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            {deviceType === 'mobile' && <Smartphone className="w-5 h-5 text-blue-600" />}
            {deviceType === 'tablet' && <Tablet className="w-5 h-5 text-blue-600" />}
            {deviceType === 'desktop' && <Monitor className="w-5 h-5 text-blue-600" />}
            <div>
              <p className="font-medium text-gray-900">Device</p>
              <p className="text-sm text-gray-600 capitalize">{deviceType} ({breakpoint})</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">System Theme</p>
              <p className="text-sm text-gray-600">{systemPreferences.prefersDark ? 'Dark' : 'Light'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Current Theme</p>
              <p className="text-sm text-gray-600 capitalize">{themeConfig.mode} • {themeConfig.colorScheme}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'layout', label: 'Layout', icon: Layout },
            { id: 'accessibility', label: 'Accessibility', icon: Eye },
            { id: 'preview', label: 'Preview', icon: Monitor }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Theme Mode */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Mode</h3>
              <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap={{ xs: '1rem', md: '1.5rem' }}>
                {themeModes.map(({ value, label, icon: Icon, description }) => (
                  <ResponsiveGridItem key={value}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode(value as any)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${preferences.mode === value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-3 ${preferences.mode === value ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                      <h4 className="font-medium text-gray-900 mb-1">{label}</h4>
                      <p className="text-sm text-gray-600">{description}</p>
                    </motion.button>
                  </ResponsiveGridItem>
                ))}
              </ResponsiveGrid>
            </div>

            {/* Color Scheme */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
              <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 5 }} gap={{ xs: '1rem', md: '1.5rem' }}>
                {colorSchemes.map(({ value, label, colors, description }) => (
                  <ResponsiveGridItem key={value}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setColorScheme(value as any)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${preferences.colorScheme === value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex space-x-1 mb-3 justify-center">
                        {colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{label}</h4>
                      <p className="text-sm text-gray-600">{description}</p>
                    </motion.button>
                  </ResponsiveGridItem>
                ))}
              </ResponsiveGrid>
            </div>
          </motion.div>
        )}

        {selectedTab === 'typography' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Font Scale */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Scale</h3>
              <ResponsiveGrid columns={{ xs: 1, md: 3 }} gap={{ xs: '1rem', md: '1.5rem' }}>
                {fontScales.map(({ value, label, description }) => (
                  <ResponsiveGridItem key={value}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFontScale(value as any)}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-left ${preferences.fontScale === value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className={`mb-3 ${value === 'compact' ? 'text-sm' :
                        value === 'spacious' ? 'text-lg' : 'text-base'
                        }`}>
                        <div className="font-semibold">Sample Text</div>
                        <div className="text-gray-600">This is how text will appear</div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{label}</h4>
                      <p className="text-sm text-gray-600">{description}</p>
                    </motion.button>
                  </ResponsiveGridItem>
                ))}
              </ResponsiveGrid>
            </div>
          </motion.div>
        )}

        {selectedTab === 'layout' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Border Radius */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Border Radius</h3>
              <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 5 }} gap={{ xs: '1rem', md: '1.5rem' }}>
                {borderRadiusOptions.map(({ value, label, description }) => (
                  <ResponsiveGridItem key={value}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBorderRadius(value as any)}
                      className={`w-full p-4 border-2 transition-all ${preferences.borderRadius === value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                        } ${value === 'none' ? 'rounded-none' :
                          value === 'small' ? 'rounded-sm' :
                            value === 'medium' ? 'rounded-lg' :
                              value === 'large' ? 'rounded-xl' : 'rounded-full'
                        }`}
                    >
                      <div className={`w-12 h-12 bg-gray-300 mx-auto mb-3 ${value === 'none' ? 'rounded-none' :
                        value === 'small' ? 'rounded-sm' :
                          value === 'medium' ? 'rounded-lg' :
                            value === 'large' ? 'rounded-xl' : 'rounded-full'
                        }`} />
                      <h4 className="font-medium text-gray-900 mb-1">{label}</h4>
                      <p className="text-sm text-gray-600">{description}</p>
                    </motion.button>
                  </ResponsiveGridItem>
                ))}
              </ResponsiveGrid>
            </div>

            {/* Animation Level */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Animation Level</h3>
              <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap={{ xs: '1rem', md: '1.5rem' }}>
                {animationLevels.map(({ value, label, description }) => (
                  <ResponsiveGridItem key={value}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAnimationLevel(value as any)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${preferences.animationLevel === value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Zap className={`w-8 h-8 mx-auto mb-3 ${preferences.animationLevel === value ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                      <h4 className="font-medium text-gray-900 mb-1">{label}</h4>
                      <p className="text-sm text-gray-600">{description}</p>
                    </motion.button>
                  </ResponsiveGridItem>
                ))}
              </ResponsiveGrid>
            </div>
          </motion.div>
        )}

        {selectedTab === 'accessibility' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Contrast className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">High Contrast</h4>
                      <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleHighContrast}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.highContrast ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.highContrast ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Reduced Motion</h4>
                      <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleReducedMotion}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.reducedMotion ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* System Preferences Info */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-medium text-blue-900 mb-3">System Preferences Detected</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Prefers Dark Mode:</span>
                  <span className="text-blue-900 font-medium">
                    {systemPreferences.prefersDark ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Prefers Reduced Motion:</span>
                  <span className="text-blue-900 font-medium">
                    {systemPreferences.prefersReducedMotion ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Prefers High Contrast:</span>
                  <span className="text-blue-900 font-medium">
                    {systemPreferences.prefersHighContrast ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Preview Mode Selector */}
            <div className="flex items-center justify-center space-x-4">
              {[
                { value: 'desktop', icon: Monitor, label: 'Desktop' },
                { value: 'tablet', icon: Tablet, label: 'Tablet' },
                { value: 'mobile', icon: Smartphone, label: 'Mobile' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setPreviewMode(value as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${previewMode === value
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Theme Previews */}
            <ResponsiveGrid columns={{ xs: 1, lg: 3 }} gap={{ xs: '1.5rem', md: '2rem' }}>
              {themePreviews.map((preview, index) => (
                <ResponsiveGridItem key={index}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-2">{preview.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{preview.description}</p>
                    <div className={`${previewMode === 'mobile' ? 'scale-75' :
                      previewMode === 'tablet' ? 'scale-90' : 'scale-100'
                      } origin-top-left transition-transform`}>
                      {preview.preview}
                    </div>
                  </div>
                </ResponsiveGridItem>
              ))}
            </ResponsiveGrid>
          </motion.div>
        )}
      </div>
    </ResponsiveContainer>
  );
};
