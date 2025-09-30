import React from 'react';
import Icon from 'components/AppIcon';

const TransactionFilters = ({ filters, onFilterChange, resultCount }) => {
  const handleFilterUpdate = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      dateRange: 'all',
      account: 'all',
      type: 'all',
      status: 'all',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2 lg:mb-0">
          Filter Transactions
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-secondary">
            {resultCount} transaction{resultCount !== 1 ? 's' : ''} found
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-secondary hover:text-secondary-700 nav-transition flex items-center space-x-1"
            >
              <Icon name="X" size={14} color="#4a90a4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Search
          </label>
          <div className="relative">
            <Icon 
              name="Search" 
              size={16} 
              color="#7f8c8d" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterUpdate('search', e.target.value)}
              placeholder="Search description, account, reference..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterUpdate('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="last-week">Last Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Account
          </label>
          <select
            value={filters.account}
            onChange={(e) => handleFilterUpdate('account', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
          >
            <option value="all">All Accounts</option>
            <option value="Office Expenses">Office Expenses</option>
            <option value="Accounts Receivable">Accounts Receivable</option>
            <option value="Bank Charges">Bank Charges</option>
            <option value="Fixed Assets">Fixed Assets</option>
            <option value="Utilities">Utilities</option>
            <option value="Cash">Cash</option>
            <option value="Accounts Payable">Accounts Payable</option>
            <option value="Revenue">Revenue</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterUpdate('type', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterUpdate('status', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="reconciled">Reconciled</option>
            <option value="pending">Pending</option>
            <option value="review">Needs Review</option>
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-text-primary mr-2">Quick Filters:</span>
          <button
            onClick={() => handleFilterUpdate('status', 'review')}
            className="px-3 py-1 text-xs bg-error-100 text-error-700 rounded-full hover:bg-error-200 nav-transition"
          >
            Needs Review
          </button>
          <button
            onClick={() => handleFilterUpdate('type', 'expense')}
            className="px-3 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 nav-transition"
          >
            Expenses Only
          </button>
          <button
            onClick={() => handleFilterUpdate('type', 'income')}
            className="px-3 py-1 text-xs bg-success-100 text-success-700 rounded-full hover:bg-success-200 nav-transition"
          >
            Income Only
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, bankFeed: true })}
            className="px-3 py-1 text-xs bg-accent-100 text-accent-700 rounded-full hover:bg-accent-200 nav-transition"
          >
            Bank Feed
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;