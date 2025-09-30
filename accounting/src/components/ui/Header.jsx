import React, { useState } from 'react';
import Icon from '../AppIcon';

const Header = ({ user, onMenuToggle, sidebarCollapsed }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    // Logout logic here
    console.log('Logging out...');
  };

  const notifications = [
    { id: 1, message: 'Critical patient in Room A-101 requires attention', time: '2 min ago', type: 'critical' },
    { id: 2, message: 'Medication due for patient in Room B-205', time: '5 min ago', type: 'warning' },
    { id: 3, message: 'New patient admission in Ward C', time: '10 min ago', type: 'info' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-header-height bg-surface border-b border-border z-header shadow-card">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - Logo and Menu Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-primary-50 nav-transition"
            aria-label="Toggle menu"
          >
            <Icon name="Menu" size={20} color="#283593" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L16 7L14.74 10.11L18 11L14.74 13.89L16 17L13.09 15.74L12 22L10.91 15.74L8 17L9.26 13.89L6 11L9.26 10.11L8 7L10.91 8.26L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-heading font-bold text-primary">MedCare Hospital</h1>
              <p className="text-xs text-text-secondary font-medium">Patient Care Management</p>
            </div>
          </div>
        </div>

        {/* Right Section - Search, Notifications, User */}
        <div className="flex items-center space-x-4">
          {/* Global Search */}
          <div className="hidden md:flex items-center bg-background rounded-xl px-4 py-2.5 w-64 border border-border">
            <Icon name="Search" size={16} color="#757575" />
            <input
              type="text"
              placeholder="Search patients, rooms, staff..."
              className="ml-2 bg-transparent text-sm text-text-primary placeholder-text-secondary outline-none flex-1"
            />
          </div>

          {/* Emergency Button */}
          <button
            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 nav-transition"
            title="Emergency Alert"
          >
            <Icon name="AlertTriangle" size={20} color="#EF4444" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-primary-50 nav-transition"
              aria-label="Notifications"
            >
              <Icon name="Bell" size={20} color="#283593" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-xl shadow-floating border border-border z-dropdown">
                <div className="p-4 border-b border-border">
                  <h3 className="font-heading font-semibold text-text-primary">Patient Alerts</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-border last:border-b-0 hover:bg-background nav-transition">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'critical' ? 'bg-error' :
                          notification.type === 'warning' ? 'bg-warning' : 'bg-secondary'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-text-primary font-medium">{notification.message}</p>
                          <p className="text-xs text-text-secondary mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <button className="text-sm text-secondary hover:text-secondary-700 nav-transition font-medium">
                    View all alerts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-primary-50 nav-transition"
              aria-label="User menu"
            >
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-card">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-text-primary">{user?.name || 'User Name'}</p>
                <p className="text-xs text-text-secondary">{user?.role || 'Staff Member'}</p>
              </div>
              <Icon name="ChevronDown" size={16} color="#757575" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl shadow-floating border border-border z-dropdown">
                <div className="p-4 border-b border-border">
                  <p className="font-semibold text-text-primary">{user?.name || 'User Name'}</p>
                  <p className="text-sm text-text-secondary">{user?.email || 'user@hospital.com'}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full font-medium">
                    {user?.role || 'Staff Member'}
                  </span>
                </div>
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background nav-transition flex items-center space-x-3">
                    <Icon name="User" size={16} color="#757575" />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background nav-transition flex items-center space-x-3">
                    <Icon name="Settings" size={16} color="#757575" />
                    <span>Preferences</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background nav-transition flex items-center space-x-3">
                    <Icon name="HelpCircle" size={16} color="#757575" />
                    <span>Help & Support</span>
                  </button>
                </div>
                <div className="border-t border-border py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-50 nav-transition flex items-center space-x-3"
                  >
                    <Icon name="LogOut" size={16} color="#F44336" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;