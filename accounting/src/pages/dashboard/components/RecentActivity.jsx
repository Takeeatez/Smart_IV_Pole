import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const RecentActivity = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: 'transaction',
      title: 'Payment received from Acme Corp',
      description: 'Invoice #INV-2024-001 - $5,250.00',
      timestamp: new Date(Date.now() - 300000),
      icon: 'CreditCard',
      color: 'success',
      user: 'Sarah Johnson'
    },
    {
      id: 2,
      type: 'reconciliation',
      title: 'Bank reconciliation completed',
      description: 'Chase Business Account - January 2024',
      timestamp: new Date(Date.now() - 1800000),
      icon: 'Building2',
      color: 'primary',
      user: 'Mike Chen'
    },
    {
      id: 3,
      type: 'report',
      title: 'Monthly P&L report generated',
      description: 'Profit & Loss statement for December 2023',
      timestamp: new Date(Date.now() - 3600000),
      icon: 'FileText',
      color: 'secondary',
      user: 'System'
    },
    {
      id: 4,
      type: 'invoice',
      title: 'New invoice created',
      description: 'Invoice #INV-2024-002 for TechStart LLC - $3,800.00',
      timestamp: new Date(Date.now() - 7200000),
      icon: 'Receipt',
      color: 'warning',
      user: 'Sarah Johnson'
    },
    {
      id: 5,
      type: 'expense',
      title: 'Expense recorded',
      description: 'Office supplies - $245.50',
      timestamp: new Date(Date.now() - 10800000),
      icon: 'ShoppingCart',
      color: 'error',
      user: 'Lisa Wong'
    },
    {
      id: 6,
      type: 'client',
      title: 'New client onboarded',
      description: 'GreenTech Solutions added to client portal',
      timestamp: new Date(Date.now() - 14400000),
      icon: 'UserPlus',
      color: 'success',
      user: 'Mike Chen'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Activity', count: activities.length },
    { id: 'transaction', label: 'Transactions', count: activities.filter(a => a.type === 'transaction').length },
    { id: 'reconciliation', label: 'Reconciliation', count: activities.filter(a => a.type === 'reconciliation').length },
    { id: 'report', label: 'Reports', count: activities.filter(a => a.type === 'report').length }
  ];

  const filteredActivities = activeTab === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === activeTab);

  const getColorClasses = (color) => {
    switch (color) {
      case 'success':
        return { bg: 'bg-success-100', icon: '#27ae60' };
      case 'warning':
        return { bg: 'bg-warning-100', icon: '#f39c12' };
      case 'error':
        return { bg: 'bg-error-100', icon: '#e74c3c' };
      case 'secondary':
        return { bg: 'bg-secondary-100', icon: '#4a90a4' };
      default:
        return { bg: 'bg-primary-100', icon: '#1e3a5f' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} min ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">Recent Activity</h3>
            <p className="text-sm text-text-secondary">Latest updates and transactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-background nav-transition">
              <Icon name="Filter" size={16} color="#7f8c8d" />
            </button>
            <button className="p-2 rounded-lg hover:bg-background nav-transition">
              <Icon name="MoreHorizontal" size={16} color="#7f8c8d" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex space-x-1 bg-background rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-3 py-2 text-sm font-medium rounded-md nav-transition
                ${activeTab === tab.id
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <span>{tab.label}</span>
              <span className={`
                ml-2 px-2 py-0.5 text-xs rounded-full
                ${activeTab === tab.id
                  ? 'bg-primary-100 text-primary' :'bg-background text-text-secondary'
                }
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredActivities.map((activity) => {
            const colors = getColorClasses(activity.color);
            return (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-background nav-transition">
                <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name={activity.icon} size={20} color={colors.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-text-primary">{activity.title}</h4>
                      <p className="text-sm text-text-secondary mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs text-text-secondary">{formatTimestamp(activity.timestamp)}</span>
                        <span className="text-xs text-text-secondary">by {activity.user}</span>
                      </div>
                    </div>
                    <button className="p-1 rounded hover:bg-primary-100 nav-transition">
                      <Icon name="MoreVertical" size={14} color="#7f8c8d" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Activity" size={24} color="#7f8c8d" />
            </div>
            <p className="text-text-secondary">No recent activity found</p>
          </div>
        )}

        {/* View All Button */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <button className="w-full text-center text-sm text-secondary hover:text-secondary-700 nav-transition font-medium">
              View all activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;