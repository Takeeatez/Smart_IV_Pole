import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const QuickActions = ({ userRole }) => {
  const navigate = useNavigate();

  // Role-based quick actions
  const getQuickActions = () => {
    const baseActions = [
      {
        id: 'new-transaction',
        title: 'Record Transaction',
        description: 'Add new income or expense',
        icon: 'Plus',
        color: 'primary',
        onClick: () => navigate('/transactions-management'),
        roles: ['partner', 'staff', 'freelancer']
      },
      {
        id: 'reconcile',
        title: 'Bank Reconciliation',
        description: 'Match bank statements',
        icon: 'Building2',
        color: 'secondary',
        onClick: () => navigate('/bank-reconciliation'),
        roles: ['partner', 'staff', 'freelancer']
      },
      {
        id: 'generate-report',
        title: 'Generate Report',
        description: 'Create financial reports',
        icon: 'FileText',
        color: 'accent',
        onClick: () => navigate('/financial-reports'),
        roles: ['partner', 'staff', 'freelancer']
      },
      {
        id: 'client-portal',
        title: 'Client Portal',
        description: 'Access client information',
        icon: 'Users',
        color: 'success',
        onClick: () => navigate('/client-portal'),
        roles: ['partner', 'staff', 'client']
      },
      {
        id: 'tax-center',
        title: 'Tax Compliance',
        description: 'Manage tax filings',
        icon: 'Calculator',
        color: 'warning',
        onClick: () => navigate('/tax-compliance-center'),
        roles: ['partner', 'staff']
      },
      {
        id: 'user-management',
        title: 'User Management',
        description: 'Manage system users',
        icon: 'Settings',
        color: 'error',
        onClick: () => navigate('/user-management'),
        roles: ['partner']
      }
    ];

    return baseActions.filter(action => action.roles.includes(userRole));
  };

  const quickActions = getQuickActions();

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return { bg: 'bg-primary-50', iconBg: 'bg-primary-100', icon: '#283593', hover: 'hover:bg-primary-100', border: 'border-primary-200' };
      case 'secondary':
        return { bg: 'bg-secondary-50', iconBg: 'bg-secondary-100', icon: '#2196F3', hover: 'hover:bg-secondary-100', border: 'border-secondary-200' };
      case 'accent':
        return { bg: 'bg-accent-50', iconBg: 'bg-accent-100', icon: '#FF9800', hover: 'hover:bg-accent-100', border: 'border-accent-200' };
      case 'success':
        return { bg: 'bg-success-50', iconBg: 'bg-success-100', icon: '#4CAF50', hover: 'hover:bg-success-100', border: 'border-success-200' };
      case 'warning':
        return { bg: 'bg-warning-50', iconBg: 'bg-warning-100', icon: '#FFC107', hover: 'hover:bg-warning-100', border: 'border-warning-200' };
      case 'error':
        return { bg: 'bg-error-50', iconBg: 'bg-error-100', icon: '#F44336', hover: 'hover:bg-error-100', border: 'border-error-200' };
      default:
        return { bg: 'bg-primary-50', iconBg: 'bg-primary-100', icon: '#283593', hover: 'hover:bg-primary-100', border: 'border-primary-200' };
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">Quick Actions</h3>
            <p className="text-sm text-text-secondary">Common tasks & shortcuts</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-background nav-transition">
            <Icon name="MoreHorizontal" size={16} color="#757575" />
          </button>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => {
            const colors = getColorClasses(action.color);
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`
                  w-full p-4 rounded-xl border-2 ${colors.border} nav-transition text-left
                  ${colors.bg} hover:shadow-card ${colors.hover}
                `}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-card`}>
                    <Icon name={action.icon} size={20} color={colors.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary">{action.title}</h4>
                    <p className="text-xs text-text-secondary mt-1">{action.description}</p>
                  </div>
                  <Icon name="ChevronRight" size={16} color="#757575" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Keyboard Shortcuts</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">New Transaction</span>
              <kbd className="px-2 py-1 bg-primary-100 rounded text-primary-700 font-data font-medium">Ctrl+N</kbd>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Search</span>
              <kbd className="px-2 py-1 bg-primary-100 rounded text-primary-700 font-data font-medium">Ctrl+K</kbd>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Generate Report</span>
              <kbd className="px-2 py-1 bg-primary-100 rounded text-primary-700 font-data font-medium">Ctrl+R</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;