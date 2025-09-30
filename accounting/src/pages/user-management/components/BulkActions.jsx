import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const BulkActions = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const bulkActions = [
    {
      id: 'activate',
      label: 'Activate Users',
      icon: 'UserCheck',
      color: 'text-success',
      description: 'Enable access for selected users'
    },
    {
      id: 'deactivate',
      label: 'Deactivate Users',
      icon: 'UserX',
      color: 'text-warning',
      description: 'Disable access for selected users'
    },
    {
      id: 'change-role',
      label: 'Change Role',
      icon: 'Shield',
      color: 'text-primary',
      description: 'Update role for selected users'
    },
    {
      id: 'update-permissions',
      label: 'Update Permissions',
      icon: 'Key',
      color: 'text-secondary',
      description: 'Modify permissions for selected users'
    },
    {
      id: 'send-invite',
      label: 'Send Invitation',
      icon: 'Mail',
      color: 'text-accent',
      description: 'Send invitation emails to selected users'
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: 'Download',
      color: 'text-text-primary',
      description: 'Export selected user data'
    },
    {
      id: 'delete',
      label: 'Delete Users',
      icon: 'Trash2',
      color: 'text-error',
      description: 'Permanently remove selected users'
    }
  ];

  const handleAction = (actionId) => {
    onBulkAction(actionId);
    setShowDropdown(false);
  };

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        {/* Selection Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={16} color="white" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-primary-700">Choose an action to apply to selected users</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => handleAction('activate')}
              className="flex items-center space-x-2 px-3 py-2 bg-success text-white rounded-lg hover:bg-success-700 nav-transition text-sm"
            >
              <Icon name="UserCheck" size={14} color="white" />
              <span>Activate</span>
            </button>
            <button
              onClick={() => handleAction('deactivate')}
              className="flex items-center space-x-2 px-3 py-2 bg-warning text-white rounded-lg hover:bg-warning-700 nav-transition text-sm"
            >
              <Icon name="UserX" size={14} color="white" />
              <span>Deactivate</span>
            </button>
          </div>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition text-sm"
            >
              <Icon name="MoreHorizontal" size={16} color="white" />
              <span>More Actions</span>
              <Icon 
                name="ChevronDown" 
                size={14} 
                color="white" 
                className={`nav-transition ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-lg shadow-floating border border-border z-dropdown">
                <div className="py-2">
                  {bulkActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      className="w-full px-4 py-3 text-left hover:bg-background nav-transition flex items-start space-x-3"
                    >
                      <Icon name={action.icon} size={16} color={`var(--color-${action.color.replace('text-', '')})`} className="mt-0.5" />
                      <div>
                        <p className={`text-sm font-medium ${action.color}`}>{action.label}</p>
                        <p className="text-xs text-text-secondary">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="flex items-center space-x-2 px-3 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition text-sm"
          >
            <Icon name="X" size={14} color="var(--color-text-primary)" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="lg:hidden mt-4 pt-4 border-t border-primary-200">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('activate')}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-success text-white rounded-lg hover:bg-success-700 nav-transition text-sm"
          >
            <Icon name="UserCheck" size={14} color="white" />
            <span>Activate</span>
          </button>
          <button
            onClick={() => handleAction('deactivate')}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-warning text-white rounded-lg hover:bg-warning-700 nav-transition text-sm"
          >
            <Icon name="UserX" size={14} color="white" />
            <span>Deactivate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;