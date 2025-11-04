import React, { useState } from 'react';
import { Settings, Share2, Phone, Globe, Link as LinkIcon, Palette } from 'lucide-react';
import { SocialMediaList } from './SocialMediaList';
import { ContactInfoList } from './ContactInfoList';
import { SiteSettingsList } from './SiteSettingsList';
import { FooterLinksList } from './FooterLinksList';
import { ThemeSettingsList } from './ThemeSettingsList';

type TabType = 'site' | 'social' | 'contact' | 'footer' | 'theme';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'site',
    label: 'Site Settings',
    icon: <Settings className="h-5 w-5" />,
    description: 'General website configuration'
  },
  {
    id: 'theme',
    label: 'Theme',
    icon: <Palette className="h-5 w-5" />,
    description: 'Customize appearance'
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: <Share2 className="h-5 w-5" />,
    description: 'Manage social media accounts'
  },
  {
    id: 'contact',
    label: 'Contact Info',
    icon: <Phone className="h-5 w-5" />,
    description: 'Business contact details'
  },
  {
    id: 'footer',
    label: 'Footer Links',
    icon: <LinkIcon className="h-5 w-5" />,
    description: 'Manage footer navigation'
  }
];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('site');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'site':
        return <SiteSettingsList />;
      case 'theme':
        return <ThemeSettingsList />;
      case 'social':
        return <SocialMediaList />;
      case 'contact':
        return <ContactInfoList />;
      case 'footer':
        return <FooterLinksList />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Website Settings</h1>
            <p className="text-xs sm:text-sm text-gray-600">Manage your website configuration and content</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
          <div className="flex min-w-min sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm min-h-[44px] sm:min-h-auto ${activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200'
                  }`}
              >
                <div className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5">
                  {tab.icon}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
                <div className="text-left sm:hidden">
                  <div className="font-medium text-xs">{tab.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

