import React, { useState } from 'react';
import { Home, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePublicSettings } from '../../../hooks/usePublicSettings';

interface CustomerTopNavbarProps {
  onMenuClick?: () => void;
}

export const CustomerTopNavbar: React.FC<CustomerTopNavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { settings } = usePublicSettings();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo and Home Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              {settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">
                {settings?.site_name || 'Aligarh Attars'}
              </span>
            </div>

            {/* Home Button */}
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
              title="Go to Home"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User Info and Avatar */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] sm:min-h-auto"
              >
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {getInitials()}
                  </span>
                </div>

                {/* User Name (hidden on mobile) */}
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user?.fullName || user?.email?.split('@')[0] || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>

                <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block flex-shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User Info (mobile) */}
                  <div className="sm:hidden px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.email?.split('@')[0] || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>

                  {/* Profile */}
                  <button
                    onClick={() => {
                      navigate('/dashboard?tab=profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

