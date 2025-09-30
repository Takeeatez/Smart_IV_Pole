import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const BulkActions = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const actions = [
    {
      id: 'reconcile',
      label: 'Mark as Reconciled',
      icon: 'CheckCircle',
      color: '#27ae60',
      description: 'Mark selected transactions as reconciled'
    },
    {
      id: 'pending',
      label: 'Mark as Pending',
      icon: 'Clock',
      color: '#f39c12',
      description: 'Mark selected transactions as pending'
    },
    {
      id: 'review',
      label: 'Mark for Review',
      icon: 'AlertCircle',
      color: '#e74c3c',
      description: 'Mark selected transactions for review'
    },
    {
      id: 'categorize',
      label: 'Bulk Categorize',
      icon: 'Tag',
      color: '#4a90a4',
      description: 'Apply category to selected transactions'
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: 'Download',
      color: '#7f8c8d',
      description: 'Export selected transactions to CSV'
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: 'Trash2',
      color: '#e74c3c',
      description: 'Permanently delete selected transactions'
    }
  ];

  const handleAction = (actionId) => {
    onBulkAction(actionId);
    setShowDropdown(false);
  };

  return (
    <div className="bg-accent-100 border border-accent-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Icon name="CheckSquare" size={16} color="white" />
          </div>
          <div>
            <p className="font-medium text-accent-700">
              {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-accent-600">
              Choose an action to apply to all selected transactions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => handleAction('reconcile')}
              className="px-3 py-2 bg-success text-white rounded-lg hover:bg-success-700 nav-transition flex items-center space-x-2 text-sm"
            >
              <Icon name="CheckCircle" size={14} color="white" />
              <span>Reconcile</span>
            </button>
            
            <button
              onClick={() => handleAction('review')}
              className="px-3 py-2 bg-error text-white rounded-lg hover:bg-error-700 nav-transition flex items-center space-x-2 text-sm"
            >
              <Icon name="AlertCircle" size={14} color="white" />
              <span>Review</span>
            </button>
          </div>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition flex items-center space-x-2"
            >
              <Icon name="MoreHorizontal" size={16} color="#2c3e50" />
              <span>More Actions</span>
              <Icon name="ChevronDown" size={14} color="#7f8c8d" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-lg shadow-floating border border-border z-dropdown">
                <div className="py-2">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      className="w-full px-4 py-3 text-left hover:bg-background nav-transition flex items-start space-x-3"
                    >
                      <Icon name={action.icon} size={16} color={action.color} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{action.label}</p>
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
            className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition flex items-center space-x-2"
          >
            <Icon name="X" size={16} color="#7f8c8d" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="lg:hidden mt-4 pt-4 border-t border-accent-200">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction('reconcile')}
            className="px-3 py-2 bg-success text-white rounded-lg hover:bg-success-700 nav-transition flex items-center justify-center space-x-2 text-sm"
          >
            <Icon name="CheckCircle" size={14} color="white" />
            <span>Reconcile</span>
          </button>
          
          <button
            onClick={() => handleAction('review')}
            className="px-3 py-2 bg-error text-white rounded-lg hover:bg-error-700 nav-transition flex items-center justify-center space-x-2 text-sm"
          >
            <Icon name="AlertCircle" size={14} color="white" />
            <span>Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;