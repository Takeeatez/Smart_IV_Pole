import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const BulkPatientActions = ({ selectedCount, onBulkAction, selectedPatients }) => {
  const [showActions, setShowActions] = useState(false);

  const bulkActions = [
    {
      id: 'transfer',
      label: 'Transfer Patients',
      description: 'Move selected patients to different ward',
      icon: 'ArrowRightLeft',
      color: 'blue'
    },
    {
      id: 'update-status',
      label: 'Update Status',
      description: 'Change patient status for selected patients',
      icon: 'RefreshCw',
      color: 'green'
    },
    {
      id: 'assign-physician',
      label: 'Assign Physician',
      description: 'Assign attending physician to patients',
      icon: 'UserCheck',
      color: 'purple'
    },
    {
      id: 'export',
      label: 'Export Records',
      description: 'Export patient records to CSV/PDF',
      icon: 'Download',
      color: 'gray'
    },
    {
      id: 'medication-review',
      label: 'Schedule Medication Review',
      description: 'Schedule medication review for patients',
      icon: 'Pill',
      color: 'orange'
    }
  ];

  const handleBulkAction = (actionId) => {
    onBulkAction(actionId, selectedPatients);
    setShowActions(false);
  };

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Icon name="CheckSquare" size={16} color="white" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">
              {selectedCount} patient{selectedCount !== 1 ? 's' : ''} selected
            </h3>
            <p className="text-sm text-primary-700">
              Choose an action to perform on selected patients
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Icon name="Zap" size={16} color="white" />
            <span>Bulk Actions</span>
            <Icon 
              name={showActions ? "ChevronUp" : "ChevronDown"} 
              size={14} 
              color="white" 
            />
          </button>
          
          <button
            onClick={() => onBulkAction('clear-selection', [])}
            className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-lg transition-colors"
            title="Clear selection"
          >
            <Icon name="X" size={16} color="currentColor" />
          </button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-primary-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bulkActions?.map((action) => {
              const colorClasses = {
                blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200',
                green: 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200',
                purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200',
                gray: 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200',
                orange: 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200'
              };

              return (
                <button
                  key={action?.id}
                  onClick={() => handleBulkAction(action?.id)}
                  className={`p-3 rounded-lg border transition-all text-left ${colorClasses[action?.color]}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 bg-${action?.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon name={action?.icon} size={16} color="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{action?.label}</h4>
                      <p className="text-xs opacity-75 mt-1 line-clamp-2">
                        {action?.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-primary-700">
              Actions will be applied to all {selectedCount} selected patient{selectedCount !== 1 ? 's' : ''}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowActions(false)}
                className="px-3 py-1 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-primary-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleBulkAction('transfer')}
            className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center space-x-1"
          >
            <Icon name="ArrowRightLeft" size={12} color="currentColor" />
            <span>Transfer</span>
          </button>
          
          <button
            onClick={() => handleBulkAction('update-status')}
            className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-1"
          >
            <Icon name="RefreshCw" size={12} color="currentColor" />
            <span>Update Status</span>
          </button>
          
          <button
            onClick={() => handleBulkAction('export')}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center space-x-1"
          >
            <Icon name="Download" size={12} color="currentColor" />
            <span>Export</span>
          </button>

          <div className="flex-1"></div>

          <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
            {selectedCount} selected
          </span>
        </div>
      </div>
    </div>
  );
};

export default BulkPatientActions;