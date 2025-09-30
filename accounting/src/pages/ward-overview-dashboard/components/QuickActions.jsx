import React from 'react';
import Icon from 'components/AppIcon';

const QuickActions = () => {
  const quickActions = [
    {
      id: 1,
      label: 'New Admission',
      description: 'Register new patient',
      icon: 'UserPlus',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      id: 2,
      label: 'Patient Transfer',
      description: 'Transfer between wards',
      icon: 'ArrowRightLeft',
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-500'
    },
    {
      id: 3,
      label: 'Discharge Patient',
      description: 'Complete discharge process',
      icon: 'UserCheck',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-500'
    },
    {
      id: 4,
      label: 'Emergency Call',
      description: 'Alert emergency team',
      icon: 'Phone',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      iconBg: 'bg-red-500'
    },
    {
      id: 5,
      label: 'Medication Round',
      description: 'Start medication round',
      icon: 'Pill',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-500'
    },
    {
      id: 6,
      label: 'Staff Handoff',
      description: 'Shift change notes',
      icon: 'Users',
      color: 'teal',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      iconBg: 'bg-teal-500'
    }
  ];

  return (
    <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Quick Actions</h3>
        <div className="flex items-center space-x-1">
          <Icon name="Zap" size={14} color="#FF9800" />
          <span className="text-xs text-text-secondary">Shortcuts</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            className={`p-3 rounded-lg border border-gray-200 ${action?.bgColor} hover:shadow-card transition-all group text-left`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${action?.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon name={action?.icon} size={16} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${action?.textColor} text-sm group-hover:text-opacity-80`}>
                  {action?.label}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                  {action?.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
          <div className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded font-mono">Ctrl+N</kbd>
            <span>New Admission</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded font-mono">Ctrl+T</kbd>
            <span>Transfer</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded font-mono">Ctrl+D</kbd>
            <span>Discharge</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-red-200 rounded font-mono">F1</kbd>
            <span>Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;