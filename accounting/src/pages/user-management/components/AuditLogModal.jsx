import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AuditLogModal = ({ onClose, users }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('7days');

  // Mock audit log data
  const auditLogs = [
    {
      id: 1,
      action: 'User Created',
      user: 'Sarah Johnson',
      target: 'Michael Chen',
      details: 'Created new staff member with transaction management permissions',
      timestamp: new Date(Date.now() - 300000),
      category: 'user_management',
      severity: 'info',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      action: 'Permission Updated',
      user: 'Sarah Johnson',
      target: 'Emily Rodriguez',
      details: 'Added financial reports permission to freelancer account',
      timestamp: new Date(Date.now() - 1800000),
      category: 'permission_change',
      severity: 'warning',
      ipAddress: '192.168.1.100'
    },
    {
      id: 3,
      action: 'User Deactivated',
      user: 'Sarah Johnson',
      target: 'David Thompson',
      details: 'Deactivated client account due to contract completion',
      timestamp: new Date(Date.now() - 3600000),
      category: 'user_management',
      severity: 'warning',
      ipAddress: '192.168.1.100'
    },
    {
      id: 4,
      action: 'Role Changed',
      user: 'Sarah Johnson',
      target: 'Lisa Wang',
      details: 'Changed role from Freelancer to Staff member',
      timestamp: new Date(Date.now() - 7200000),
      category: 'role_change',
      severity: 'info',
      ipAddress: '192.168.1.100'
    },
    {
      id: 5,
      action: 'Bulk Permission Update',
      user: 'Sarah Johnson',
      target: 'Multiple Users (3)',
      details: 'Updated bank reconciliation permissions for staff members',
      timestamp: new Date(Date.now() - 10800000),
      category: 'permission_change',
      severity: 'info',
      ipAddress: '192.168.1.100'
    },
    {
      id: 6,
      action: 'Failed Login Attempt',
      user: 'Unknown',
      target: 'michael.chen@company.com',
      details: 'Multiple failed login attempts detected from suspicious IP',
      timestamp: new Date(Date.now() - 14400000),
      category: 'security',
      severity: 'error',
      ipAddress: '203.0.113.45'
    },
    {
      id: 7,
      action: 'Password Reset',
      user: 'System',
      target: 'Emily Rodriguez',
      details: 'Password reset requested and completed successfully',
      timestamp: new Date(Date.now() - 18000000),
      category: 'security',
      severity: 'info',
      ipAddress: '198.51.100.23'
    },
    {
      id: 8,
      action: 'User Invited',
      user: 'Sarah Johnson',
      target: 'john.doe@newclient.com',
      details: 'Sent invitation email to new client user',
      timestamp: new Date(Date.now() - 21600000),
      category: 'user_management',
      severity: 'info',
      ipAddress: '192.168.1.100'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Activities', count: auditLogs.length },
    { id: 'user_management', label: 'User Management', count: auditLogs.filter(log => log.category === 'user_management').length },
    { id: 'permission_change', label: 'Permissions', count: auditLogs.filter(log => log.category === 'permission_change').length },
    { id: 'security', label: 'Security', count: auditLogs.filter(log => log.category === 'security').length },
    { id: 'role_change', label: 'Role Changes', count: auditLogs.filter(log => log.category === 'role_change').length }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'bg-error-100 text-error-700';
      case 'warning': return 'bg-warning-100 text-warning-700';
      case 'info': return 'bg-primary-100 text-primary-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return 'AlertTriangle';
      case 'warning': return 'AlertCircle';
      case 'info': return 'Info';
      default: return 'Circle';
    }
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

  const filteredLogs = auditLogs.filter(log => {
    const matchesTab = activeTab === 'all' || log.category === activeTab;
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter logic
    const now = new Date();
    const logDate = log.timestamp;
    let matchesDate = true;
    
    switch (dateFilter) {
      case '1day':
        matchesDate = now - logDate < 86400000;
        break;
      case '7days':
        matchesDate = now - logDate < 604800000;
        break;
      case '30days':
        matchesDate = now - logDate < 2592000000;
        break;
      default:
        matchesDate = true;
    }
    
    return matchesTab && matchesSearch && matchesDate;
  });

  const handleExport = () => {
    console.log('Exporting audit logs...');
    // Implement export functionality
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <div className="bg-surface rounded-lg shadow-floating max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-semibold text-text-primary">Audit Log</h2>
              <p className="text-sm text-text-secondary mt-1">Track all user management activities and security events</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition text-sm"
              >
                <Icon name="Download" size={14} color="white" />
                <span>Export</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-background rounded-lg nav-transition"
              >
                <Icon name="X" size={20} color="var(--color-text-secondary)" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-border bg-background">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 lg:max-w-md">
              <div className="relative">
                <Icon 
                  name="Search" 
                  size={16} 
                  color="var(--color-text-secondary)" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-text-secondary">Period:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent text-sm bg-surface"
              >
                <option value="1day">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm nav-transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-background text-text-secondary'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredLogs.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-background nav-transition">
                  <div className="flex items-start space-x-4">
                    {/* Severity Indicator */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getSeverityColor(log.severity)} flex-shrink-0 mt-1`}>
                      <Icon name={getSeverityIcon(log.severity)} size={16} color="currentColor" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-text-primary">{log.action}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mb-2">{log.details}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                            <span className="flex items-center space-x-1">
                              <Icon name="User" size={12} color="currentColor" />
                              <span>By: {log.user}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Icon name="Target" size={12} color="currentColor" />
                              <span>Target: {log.target}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Icon name="Globe" size={12} color="currentColor" />
                              <span>IP: {log.ipAddress}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-text-secondary ml-4">
                          <p>{formatDateTime(log.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="FileText" size={32} color="var(--color-primary)" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No audit logs found</h3>
              <p className="text-text-secondary">No activities match your current filters.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-background">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Showing {filteredLogs.length} of {auditLogs.length} activities</span>
            <span>Last updated: {formatDateTime(new Date())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;