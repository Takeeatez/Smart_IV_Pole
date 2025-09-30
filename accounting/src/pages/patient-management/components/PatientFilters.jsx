import React from 'react';
import Icon from 'components/AppIcon';

const PatientFilters = ({ filters, onFilterChange, searchQuery, onSearchChange, totalPatients }) => {
  const wardOptions = [
    { value: 'all', label: 'All Wards' },
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Surgery', label: 'Surgery' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'ICU', label: 'ICU' },
    { value: 'Emergency', label: 'Emergency' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Monitoring', label: 'Under Monitoring' },
    { value: 'Stable', label: 'Stable' },
    { value: 'Discharged', label: 'Discharged' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      ward: 'all',
      status: 'all',
      condition: 'all',
      priority: 'all'
    });
    onSearchChange('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all') || searchQuery;

  return (
    <div className="bg-surface rounded-xl p-6 shadow-card border border-border mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={18} color="#6B7280" className="absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients by name, ID, or room number..."
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-primary"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={16} color="currentColor" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <select
          value={filters.ward}
          onChange={(e) => handleFilterChange('ward', e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {wardOptions?.map(option => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {statusOptions?.map(option => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {priorityOptions?.map(option => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filter by condition/diagnosis..."
          className="px-4 py-2 bg-background border border-border rounded-xl text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-primary"
          value={filters.condition === 'all' ? '' : filters.condition}
          onChange={(e) => handleFilterChange('condition', e.target.value || 'all')}
        />
      </div>

      {/* Filter Actions and Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-text-secondary">
            Showing <span className="font-medium text-text-primary">{totalPatients}</span> patients
          </p>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-secondary hover:text-secondary-700 font-medium flex items-center space-x-1"
            >
              <Icon name="X" size={14} color="currentColor" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-background border border-border text-text-primary rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2">
            <Icon name="Filter" size={14} color="currentColor" />
            <span>Advanced Filters</span>
          </button>
          
          <button className="px-3 py-2 bg-background border border-border text-text-primary rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2">
            <Icon name="ArrowUpDown" size={14} color="currentColor" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.ward !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
              Ward: {filters.ward}
              <button
                onClick={() => handleFilterChange('ward', 'all')}
                className="ml-2 text-blue-400 hover:text-blue-600"
              >
                <Icon name="X" size={12} color="currentColor" />
              </button>
            </span>
          )}
          
          {filters.status !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-2 text-green-400 hover:text-green-600"
              >
                <Icon name="X" size={12} color="currentColor" />
              </button>
            </span>
          )}
          
          {filters.priority !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              Priority: {filters.priority}
              <button
                onClick={() => handleFilterChange('priority', 'all')}
                className="ml-2 text-orange-400 hover:text-orange-600"
              >
                <Icon name="X" size={12} color="currentColor" />
              </button>
            </span>
          )}
          
          {filters.condition !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
              Condition: {filters.condition}
              <button
                onClick={() => handleFilterChange('condition', 'all')}
                className="ml-2 text-purple-400 hover:text-purple-600"
              >
                <Icon name="X" size={12} color="currentColor" />
              </button>
            </span>
          )}
          
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={12} color="currentColor" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientFilters;