import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const UserProfileDropdown = ({ user, onLogout, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    console.log('Navigate to profile settings');
    setIsOpen(false);
  };

  const handlePreferencesClick = () => {
    console.log('Navigate to preferences');
    setIsOpen(false);
  };

  const handleHelpClick = () => {
    console.log('Navigate to help');
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
  };

  const menuItems = [
    {
      label: 'Profile Settings',
      icon: 'User',
      onClick: handleProfileClick,
      color: '#7f8c8d'
    },
    {
      label: 'Preferences',
      icon: 'Settings',
      onClick: handlePreferencesClick,
      color: '#7f8c8d'
    },
    {
      label: 'Help & Support',
      icon: 'HelpCircle',
      onClick: handleHelpClick,
      color: '#7f8c8d'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-100 nav-transition focus:outline-none focus:ring-2 focus:ring-border-focus"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-text-primary">{user?.name || 'User Name'}</p>
          <p className="text-xs text-text-secondary">{user?.role || 'Staff Member'}</p>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          color="#7f8c8d"
          className={`nav-transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-lg shadow-floating border border-border z-dropdown">
          {/* User Info Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{user?.name || 'User Name'}</p>
                <p className="text-sm text-text-secondary truncate">{user?.email || 'user@company.com'}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full font-medium">
                <Icon name="Shield" size={12} color="#0e7490" className="mr-1" />
                {user?.role || 'Staff Member'}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background nav-transition flex items-center space-x-3 focus:outline-none focus:bg-background"
              >
                <Icon name={item.icon} size={16} color={item.color} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Account Status */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Account Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-success font-medium">Active</span>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="border-t border-border py-2">
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-100 nav-transition flex items-center space-x-3 focus:outline-none focus:bg-error-100"
            >
              <Icon name="LogOut" size={16} color="#e74c3c" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;