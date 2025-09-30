import React from 'react';
import Icon from 'components/AppIcon';

const KPICard = ({ data }) => {
  const { title, value, change, trend, icon, color, description } = data;

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          gradient: 'gradient-success',
          bg: 'bg-success-50',
          iconBg: 'bg-success-100',
          icon: '#4CAF50',
          trend: 'text-success-600',
          border: 'border-success-200'
        };
      case 'warning':
        return {
          gradient: 'gradient-warning',
          bg: 'bg-warning-50',
          iconBg: 'bg-warning-100',
          icon: '#FFC107',
          trend: 'text-warning-600',
          border: 'border-warning-200'
        };
      case 'error':
        return {
          gradient: 'gradient-error',
          bg: 'bg-error-50',
          iconBg: 'bg-error-100',
          icon: '#F44336',
          trend: 'text-error-600',
          border: 'border-error-200'
        };
      case 'secondary':
        return {
          gradient: 'gradient-secondary',
          bg: 'bg-secondary-50',
          iconBg: 'bg-secondary-100',
          icon: '#2196F3',
          trend: 'text-secondary-600',
          border: 'border-secondary-200'
        };
      default:
        return {
          gradient: 'gradient-primary',
          bg: 'bg-primary-50',
          iconBg: 'bg-primary-100',
          icon: '#283593',
          trend: 'text-primary-600',
          border: 'border-primary-200'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`bg-surface rounded-xl border-2 ${colors.border} p-6 hover:shadow-card-hover nav-transition relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <div className={`w-full h-full ${colors.gradient} rounded-full transform translate-x-8 -translate-y-8`}></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-card`}>
            <Icon name={icon} size={28} color={colors.icon} />
          </div>
          <div className={`flex items-center space-x-1 ${colors.trend}`}>
            <Icon 
              name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
              size={18} 
              color={colors.icon}
            />
            <span className="text-sm font-semibold">{change}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">{title}</h3>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;