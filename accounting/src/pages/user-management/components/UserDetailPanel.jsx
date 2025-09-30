import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const UserDetailPanel = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  if (!user) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="User" size={32} color="var(--color-primary)" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Select a User</h3>
          <p className="text-text-secondary">Choose a user from the table to view their details and manage permissions.</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      permissions: [...user.permissions]
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...editForm };
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isOnline = (lastActivity) => {
    return Date.now() - lastActivity.getTime() < 900000; // 15 minutes
  };

  const availablePermissions = [
    'Full Access',
    'User Management',
    'Transaction Management',
    'Financial Reports',
    'Bank Reconciliation',
    'Tax Compliance',
    'Client Portal',
    'View Reports',
    'Export Data',
    'Audit Logs'
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'permissions', label: 'Permissions', icon: 'Shield' },
    { id: 'activity', label: 'Activity', icon: 'Activity' }
  ];

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-text-primary">User Details</h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition"
            >
              <Icon name="Edit" size={14} color="white" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm border border-border text-text-primary rounded-lg hover:bg-background nav-transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Header */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            {isOnline(user.lastActivity) && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
                />
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
                />
              </div>
            ) : (
              <>
                <h4 className="text-xl font-heading font-semibold text-text-primary">{user.name}</h4>
                <p className="text-text-secondary">{user.email}</p>
              </>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'Partner' ? 'bg-accent-100 text-accent-700' :
                user.role === 'Staff' ? 'bg-primary-100 text-primary-700' :
                user.role === 'Freelancer'? 'bg-secondary-100 text-secondary-700' : 'bg-warning-100 text-warning-700'
              }`}>
                {user.role}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'Active' ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm nav-transition ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name={tab.icon} size={16} color="currentColor" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium text-text-primary mb-3">Contact Information</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="px-3 py-1 border border-border rounded text-sm focus:ring-2 focus:ring-border-focus focus:border-transparent"
                    />
                  ) : (
                    <span className="text-sm text-text-primary">{user.phone}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Department</span>
                  <span className="text-sm text-text-primary">{user.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Join Date</span>
                  <span className="text-sm text-text-primary">{formatDate(user.joinDate)}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-text-primary mb-3">Account Settings</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Role</span>
                  {isEditing ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                      className="px-3 py-1 border border-border rounded text-sm focus:ring-2 focus:ring-border-focus focus:border-transparent"
                    >
                      <option value="Partner">Partner</option>
                      <option value="Staff">Staff</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Client">Client</option>
                    </select>
                  ) : (
                    <span className="text-sm text-text-primary">{user.role}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Status</span>
                  {isEditing ? (
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-1 border border-border rounded text-sm focus:ring-2 focus:ring-border-focus focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    <span className="text-sm text-text-primary">{user.status}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Last Activity</span>
                  <span className="text-sm text-text-primary">{formatDateTime(user.lastActivity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-text-primary">Permission Matrix</h5>
            <div className="space-y-2">
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center justify-between py-2">
                  <span className="text-sm text-text-primary">{permission}</span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editForm.permissions?.includes(permission)}
                      onChange={(e) => {
                        const newPermissions = e.target.checked
                          ? [...(editForm.permissions || []), permission]
                          : (editForm.permissions || []).filter(p => p !== permission);
                        setEditForm(prev => ({ ...prev, permissions: newPermissions }));
                      }}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                  ) : (
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${
                      user.permissions.includes(permission) ? 'bg-success text-white' : 'bg-gray-200'
                    }`}>
                      {user.permissions.includes(permission) && (
                        <Icon name="Check" size={12} color="white" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium text-text-primary mb-3">Recent Login History</h5>
              <div className="space-y-3">
                {user.loginHistory.map((login, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <p className="text-sm text-text-primary">{login.device}</p>
                      <p className="text-xs text-text-secondary">{login.ip}</p>
                    </div>
                    <span className="text-xs text-text-secondary">{formatDateTime(login.date)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-text-primary mb-3">Activity Log</h5>
              <div className="space-y-3">
                {user.activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 py-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{activity.action}</p>
                      <p className="text-xs text-text-secondary">{formatDateTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailPanel;