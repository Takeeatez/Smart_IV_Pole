import React from 'react';
import Icon from 'components/AppIcon';

const PatientStatusCard = ({ status, count, label, color }) => {
  const getStatusConfig = (color) => {
    switch (color) {
      case 'red':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          iconBg: 'bg-red-100',
          iconColor: '#EF4444',
          icon: 'AlertTriangle'
        };
      case 'yellow':
        return {
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          iconColor: '#F59E0B',
          icon: 'Clock'
        };
      case 'green':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          iconBg: 'bg-green-100',
          iconColor: '#10B981',
          icon: 'CheckCircle'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
          iconColor: '#6B7280',
          icon: 'Users'
        };
    }
  };

  const config = getStatusConfig(color);

  return (
    <div className={`${config.bgColor} rounded-xl p-4 border border-gray-200 hover:shadow-card transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-text-primary">{count}</p>
          <p className={`text-sm font-medium ${config.textColor} mt-1`}>{label}</p>
        </div>
        <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center`}>
          <Icon name={config.icon} size={20} color={config.iconColor} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className={`text-xs font-medium ${config.textColor} hover:underline`}>
          View Patients
        </button>
        <div className="flex items-center space-x-1">
          <div className={`w-1 h-1 ${config.textColor.replace('text-', 'bg-')} rounded-full`}></div>
          <span className="text-xs text-text-secondary">Live</span>
        </div>
      </div>
    </div>
  );
};

export default PatientStatusCard;