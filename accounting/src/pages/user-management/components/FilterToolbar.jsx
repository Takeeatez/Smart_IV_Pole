import React from 'react';
import Icon from 'components/AppIcon';

const FilterToolbar = ({ filters, onFiltersChange, userCount }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      role: 'all',
      permission: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.search || filters.role !== 'all' || filters.permission !== 'all' || filters.status !== 'all';

  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-6">
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
              placeholder="Search users by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-text-secondary whitespace-nowrap">Role:</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent text-sm bg-surface"
            >
              <option value="all">All Roles</option>
              <option value="Partner">Partner</option>
              <option value="Staff">Staff</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Client">Client</option>
            </select>
          </div>

          {/* Permission Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-text-secondary whitespace-nowrap">Permission:</label>
            <select
              value={filters.permission}
              onChange={(e) => handleFilterChange('permission', e.target.value)}
              className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent text-sm bg-surface"
            >
              <option value="all">All Permissions</option>
              <option value="Full Access">Full Access</option>
              <option value="User Management">User Management</option>
              <option value="Transaction Management">Transaction Management</option>
              <option value="Financial Reports">Financial Reports</option>
              <option value="Bank Reconciliation">Bank Reconciliation</option>
              <option value="Tax Compliance">Tax Compliance</option>
              <option value="Client Portal">Client Portal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-text-secondary whitespace-nowrap">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent text-sm bg-surface"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-background nav-transition"
            >
              <Icon name="X" size={14} color="currentColor" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <span>Showing {userCount} users</span>
            {hasActiveFilters && (
              <span className="flex items-center space-x-1">
                <Icon name="Filter" size={14} color="var(--color-text-secondary)" />
                <span>Filters applied</span>
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-background nav-transition">
              <Icon name="Download" size={14} color="currentColor" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-background nav-transition">
              <Icon name="RefreshCw" size={14} color="currentColor" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterToolbar;