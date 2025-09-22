import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, Edit3, Save, X, LogOut, Package, Heart, Settings, Shield, CreditCard, MapPin, Download, Upload, Trash2, Check, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { NetworkStatus } from '../components/Common/ErrorFallback';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  website: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    timezone: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    newsletterSubscription: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number;
  };
  social: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  avatarUrl: string;
}

type TabType = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'preferences' | 'data';

interface OrderSummary {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
}

interface WishlistSummary {
  total: number;
  inStock: number;
  onSale: number;
}

export const ProductionProfilePage: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const { isOnline } = useNetworkStatus();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Mock data - in real app, this would come from API
  const [orderSummary] = useState<OrderSummary>({
    total: 12,
    pending: 2,
    completed: 9,
    cancelled: 1,
    totalSpent: 2450.00
  });

  const [wishlistSummary] = useState<WishlistSummary>({
    total: 8,
    inStock: 6,
    onSale: 3
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    website: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      newsletterSubscription: false
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 30
    },
    social: {},
    avatarUrl: user?.avatar || ''
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, description: 'Personal information' },
    { id: 'orders', name: 'Orders', icon: Package, description: 'Order history' },
    { id: 'wishlist', name: 'Wishlist', icon: Heart, description: 'Saved items' },
    { id: 'addresses', name: 'Addresses', icon: MapPin, description: 'Shipping addresses' },
    { id: 'security', name: 'Security', icon: Shield, description: 'Account security' },
    { id: 'preferences', name: 'Preferences', icon: Settings, description: 'App settings' },
    { id: 'data', name: 'Data', icon: Download, description: 'Export & privacy' }
  ];

  // Handle profile update
  const handleProfileUpdate = useCallback(async () => {
    if (!isOnline) {
      showNotification({
        type: 'warning',
        title: 'Offline Mode',
        message: 'Profile updates require an internet connection.'
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      await updateProfile({
        name: profileData.fullName,
        phone: profileData.phone,
        avatar: profileData.avatarUrl
      });

      showNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.'
      });

      setIsEditing(false);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [profileData, updateProfile, showNotification, isOnline]);

  // Handle avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file) return;

    setLoading(true);
    try {
      // In a real app, you'd upload to your storage service
      const avatarUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatarUrl }));
      setAvatarFile(file);

      showNotification({
        type: 'success',
        title: 'Avatar Updated',
        message: 'Profile picture updated successfully.'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload avatar. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Handle data export
  const handleDataExport = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would generate and download user data
      const userData = {
        profile: profileData,
        orders: orderSummary,
        wishlist: wishlistSummary,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Data Exported',
        message: 'Your data has been exported successfully.'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [profileData, orderSummary, wishlistSummary, showNotification]);

  // PWA-specific effects
  useEffect(() => {
    // Register for push notifications if supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.pushManager.getSubscription();
      }).then(subscription => {
        if (!subscription && profileData.preferences.pushNotifications) {
          // Request push notification permission
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              showNotification({
                type: 'success',
                title: 'Notifications Enabled',
                message: 'You\'ll receive important updates about your orders.'
              });
            }
          });
        }
      }).catch(console.error);
    }

    // Handle offline/online status
    const handleOnline = () => {
      showNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Your profile data will sync automatically.'
      });
    };

    const handleOffline = () => {
      showNotification({
        type: 'warning',
        title: 'Offline Mode',
        message: 'Some features may be limited while offline.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [profileData.preferences.pushNotifications, showNotification]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <User className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Sign In Required</h2>
          <p className="text-text-secondary">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Network Status */}
      <NetworkStatus />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">My Profile</h1>
              <p className="text-text-secondary">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-border-primary">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-secondary'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background-secondary rounded-xl p-6 sticky top-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {profileData.avatarUrl ? (
                      <img
                        src={profileData.avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profileData.fullName.charAt(0).toUpperCase()
                    )}
                  </div>

                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-text-primary mt-3">
                  {profileData.fullName || 'Your Name'}
                </h3>
                <p className="text-text-secondary text-sm">{profileData.email}</p>

                {!isOnline && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Offline Mode
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-text-secondary">Orders</span>
                  </div>
                  <span className="font-semibold text-text-primary">{orderSummary.total}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-text-secondary">Wishlist</span>
                  </div>
                  <span className="font-semibold text-text-primary">{wishlistSummary.total}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-text-secondary">Total Spent</span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    ${orderSummary.totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-background-secondary rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Personal Information</h2>
                    {isEditing && (
                      <button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-background-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-background-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-background-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-background-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-background-secondary rounded-xl p-6"
                >
                  <h2 className="text-xl font-semibold text-text-primary mb-6">Order History</h2>

                  {/* Order Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold text-text-primary">{orderSummary.total}</p>
                          <p className="text-sm text-text-secondary">Total Orders</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-text-primary">{orderSummary.pending}</p>
                          <p className="text-sm text-text-secondary">Pending</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-text-primary">{orderSummary.completed}</p>
                          <p className="text-sm text-text-secondary">Completed</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold text-text-primary">${orderSummary.totalSpent.toFixed(2)}</p>
                          <p className="text-sm text-text-secondary">Total Spent</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-text-primary">Recent Orders</h3>

                    {/* Mock order items */}
                    {[1, 2, 3].map((order) => (
                      <div key={order} className="border border-border-primary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-text-primary">Order #ORD-2024-{order.toString().padStart(4, '0')}</p>
                            <p className="text-sm text-text-secondary">Placed on January {order + 10}, 2024</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-text-primary">${(Math.random() * 200 + 50).toFixed(2)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order === 1 ? 'bg-green-100 text-green-800' :
                              order === 2 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                              {order === 1 ? 'Delivered' : order === 2 ? 'Shipped' : 'Processing'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-background-primary rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-text-secondary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-text-primary">Premium Perfume Collection</p>
                            <p className="text-xs text-text-secondary">{Math.floor(Math.random() * 3) + 1} items</p>
                          </div>
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-background-secondary rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">My Wishlist</h2>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Heart className="w-4 h-4" />
                      {wishlistSummary.total} items saved
                    </div>
                  </div>

                  {/* Wishlist Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-red-500" />
                        <div>
                          <p className="text-xl font-bold text-text-primary">{wishlistSummary.total}</p>
                          <p className="text-sm text-text-secondary">Total Items</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-text-primary">{wishlistSummary.inStock}</p>
                          <p className="text-sm text-text-secondary">In Stock</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-500">%</span>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-text-primary">{wishlistSummary.onSale}</p>
                          <p className="text-sm text-text-secondary">On Sale</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wishlist Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="border border-border-primary rounded-lg p-4 group hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-background-primary rounded-lg mb-3 flex items-center justify-center">
                          <Package className="w-8 h-8 text-text-secondary" />
                        </div>

                        <h4 className="font-medium text-text-primary mb-1">Premium Perfume {item}</h4>
                        <p className="text-sm text-text-secondary mb-2">Luxury Collection</p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-text-primary">${(Math.random() * 100 + 50).toFixed(2)}</span>
                            {Math.random() > 0.5 && (
                              <span className="text-xs text-red-500 ml-2">On Sale!</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="p-1 text-text-secondary hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-background-secondary rounded-xl p-6"
                >
                  <h2 className="text-xl font-semibold text-text-primary mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    {/* Password Section */}
                    <div className="border border-border-primary rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-text-primary">Password</h3>
                          <p className="text-sm text-text-secondary">Last changed 3 months ago</p>
                        </div>
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                          Change Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border border-border-primary rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-text-primary">Two-Factor Authentication</h3>
                          <p className="text-sm text-text-secondary">
                            {profileData.security.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                          </p>
                        </div>
                        <button
                          onClick={() => setProfileData(prev => ({
                            ...prev,
                            security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
                          }))}
                          className={`px-4 py-2 rounded-lg transition-colors ${profileData.security.twoFactorEnabled
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                        >
                          {profileData.security.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                        </button>
                      </div>

                      {profileData.security.twoFactorEnabled && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Two-factor authentication is active
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Login Notifications */}
                    <div className="border border-border-primary rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-text-primary">Login Notifications</h3>
                          <p className="text-sm text-text-secondary">Get notified of new sign-ins</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileData.security.loginNotifications}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              security: { ...prev.security, loginNotifications: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Session Timeout */}
                    <div className="border border-border-primary rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-text-primary">Session Timeout</h3>
                          <p className="text-sm text-text-secondary">Automatically sign out after inactivity</p>
                        </div>
                        <select
                          value={profileData.security.sessionTimeout}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                          }))}
                          className="px-3 py-2 bg-background-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={0}>Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Data Export Tab */}
              {activeTab === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-background-secondary rounded-xl p-6"
                >
                  <h2 className="text-xl font-semibold text-text-primary mb-6">Data & Privacy</h2>

                  <div className="space-y-6">
                    {/* Export Data */}
                    <div className="border border-border-primary rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-text-primary">Export Your Data</h3>
                          <p className="text-sm text-text-secondary">Download a copy of your account data</p>
                        </div>
                        <button
                          onClick={handleDataExport}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Export Data
                        </button>
                      </div>

                      <div className="text-sm text-text-secondary">
                        <p>Your export will include:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Profile information</li>
                          <li>Order history</li>
                          <li>Wishlist items</li>
                          <li>Addresses</li>
                          <li>Preferences</li>
                        </ul>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-red-800">Delete Account</h3>
                          <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Delete Account
                        </button>
                      </div>

                      <div className="text-sm text-red-600">
                        <p className="font-medium">This action cannot be undone. This will:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Delete your profile and account</li>
                          <li>Remove all your orders and data</li>
                          <li>Cancel any active subscriptions</li>
                          <li>Remove you from all mailing lists</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionProfilePage;