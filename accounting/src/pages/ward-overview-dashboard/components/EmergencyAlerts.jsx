import React from 'react';
import Icon from 'components/AppIcon';

const EmergencyAlerts = ({ alerts }) => {
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-600',
          iconBg: 'bg-red-500',
          iconColor: 'white',
          icon: 'AlertCircle'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-600',
          iconBg: 'bg-orange-500',
          iconColor: 'white',
          icon: 'AlertTriangle'
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-600',
          iconBg: 'bg-yellow-500',
          iconColor: 'white',
          icon: 'Clock'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-600',
          iconBg: 'bg-blue-500',
          iconColor: 'white',
          icon: 'Info'
        };
    }
  };

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'vitals':
        return 'Activity';
      case 'medication':
        return 'Pill';
      case 'assistance':
        return 'HelpCircle';
      default:
        return 'Bell';
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Emergency Alerts</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          <span className="text-xs text-text-secondary">{alerts?.length} active</span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts?.length > 0 ? (
          alerts?.map((alert) => {
            const config = getPriorityConfig(alert?.priority);
            return (
              <div 
                key={alert?.id}
                className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} hover:shadow-card transition-all cursor-pointer`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon name={config.icon} size={14} color={config.iconColor} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-text-primary text-sm truncate">
                        {alert?.patientName}
                      </h4>
                      <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                        {alert?.time}
                      </span>
                    </div>
                    
                    <p className={`text-xs ${config.textColor} font-medium mb-1`}>
                      {alert?.alert}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name="MapPin" size={12} color="#6B7280" />
                        <span className="text-xs text-text-secondary">{alert?.room}</span>
                        <Icon name={getAlertTypeIcon(alert?.type)} size={12} color="#6B7280" />
                        <span className="text-xs text-text-secondary capitalize">{alert?.type}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                        {alert?.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {alert?.priority === 'critical' && (
                  <div className="mt-3 flex space-x-2">
                    <button className="flex-1 py-1.5 px-3 bg-error text-white rounded text-xs font-medium hover:bg-error-600 transition-colors">
                      Respond Now
                    </button>
                    <button className="flex-1 py-1.5 px-3 bg-white text-error border border-error-200 rounded text-xs font-medium hover:bg-error-50 transition-colors">
                      Assign Staff
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="CheckCircle" size={24} color="#10B981" />
            </div>
            <p className="text-text-secondary text-sm">No active alerts</p>
            <p className="text-text-secondary text-xs mt-1">All patients stable</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex space-x-2">
          <button className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
            View All Alerts
          </button>
          <button className="py-2 px-4 bg-background text-text-primary border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlerts;