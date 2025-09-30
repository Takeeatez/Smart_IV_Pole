import React from 'react';
import Icon from 'components/AppIcon';

const WardStatusCard = ({ ward }) => {
  const getOccupancyColor = (rate) => {
    if (rate >= 90) return 'text-error';
    if (rate >= 75) return 'text-warning';
    return 'text-success';
  };

  const getOccupancyBgColor = (rate) => {
    if (rate >= 90) return 'bg-error-100';
    if (rate >= 75) return 'bg-warning-100';
    return 'bg-success-100';
  };

  return (
    <div className="bg-surface rounded-xl p-5 shadow-card border border-border hover:shadow-floating transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary text-base">{ward?.name}</h3>
          <p className="text-text-secondary text-sm mt-1">
            {ward?.staffAssigned} staff assigned
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getOccupancyBgColor(ward?.occupancyRate)} ${getOccupancyColor(ward?.occupancyRate)}`}>
          {ward?.occupancyRate}% occupied
        </div>
      </div>

      {/* Bed Status */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{ward?.totalBeds}</p>
          <p className="text-xs text-text-secondary">Total Beds</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-error">{ward?.occupiedBeds}</p>
          <p className="text-xs text-text-secondary">Occupied</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-success">{ward?.availableBeds}</p>
          <p className="text-xs text-text-secondary">Available</p>
        </div>
      </div>

      {/* Patient Status */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-error rounded-full"></div>
            <span className="text-text-secondary">Critical: {ward?.criticalPatients}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-text-secondary">Monitoring: {ward?.monitoringPatients}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-text-secondary">Stable: {ward?.stablePatients}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <button className="flex items-center space-x-1 text-secondary hover:text-secondary-700 text-sm font-medium transition-colors">
          <Icon name="Eye" size={14} color="currentColor" />
          <span>View Details</span>
        </button>
        <button className="flex items-center space-x-1 text-secondary hover:text-secondary-700 text-sm font-medium transition-colors">
          <Icon name="Activity" size={14} color="currentColor" />
          <span>Monitor</span>
        </button>
      </div>
    </div>
  );
};

export default WardStatusCard;