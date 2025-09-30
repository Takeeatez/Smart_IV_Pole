import React from 'react';

const FloorPlanVisualization = ({ selectedWard }) => {
  const bedData = [
    { id: 'A101', status: 'occupied-critical', patient: 'J. Smith' },
    { id: 'A102', status: 'occupied-stable', patient: 'M. Davis' },
    { id: 'A103', status: 'occupied-monitoring', patient: 'R. Johnson' },
    { id: 'A104', status: 'available', patient: null },
    { id: 'A105', status: 'occupied-stable', patient: 'L. Wilson' },
    { id: 'A106', status: 'occupied-critical', patient: 'K. Brown' },
    { id: 'A107', status: 'available', patient: null },
    { id: 'A108', status: 'occupied-monitoring', patient: 'S. Garcia' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied-critical':
        return 'bg-red-500 border-red-600';
      case 'occupied-monitoring':
        return 'bg-yellow-500 border-yellow-600';
      case 'occupied-stable':
        return 'bg-green-500 border-green-600';
      case 'available':
        return 'bg-gray-200 border-gray-300';
      default:
        return 'bg-gray-200 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'occupied-critical':
        return 'Critical';
      case 'occupied-monitoring':
        return 'Monitoring';
      case 'occupied-stable':
        return 'Stable';
      case 'available':
        return 'Available';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
      {/* Legend */}
      <div className="mb-6">
        <h3 className="font-semibold text-text-primary mb-3">Ward A Floor Plan</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded border border-red-600"></div>
            <span className="text-text-secondary">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded border border-yellow-600"></div>
            <span className="text-text-secondary">Monitoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded border border-green-600"></div>
            <span className="text-text-secondary">Stable</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded border border-gray-300"></div>
            <span className="text-text-secondary">Available</span>
          </div>
        </div>
      </div>

      {/* Floor Plan Grid */}
      <div className="relative">
        {/* Corridor */}
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-8 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-blue-600">CORRIDOR</span>
        </div>

        {/* Left Side Beds */}
        <div className="grid grid-cols-4 gap-3 mb-16">
          {bedData.slice(0, 4).map((bed) => (
            <div key={bed.id} className="relative group">
              <div className={`w-12 h-8 rounded ${getStatusColor(bed.status)} cursor-pointer transform hover:scale-105 transition-all`}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-text-primary">
                  {bed.id}
                </div>
                {bed.patient && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-secondary whitespace-nowrap">
                    {bed.patient}
                  </div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {bed.id}: {getStatusLabel(bed.status)}
                {bed.patient && ` - ${bed.patient}`}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side Beds */}
        <div className="grid grid-cols-4 gap-3">
          {bedData.slice(4, 8).map((bed) => (
            <div key={bed.id} className="relative group">
              <div className={`w-12 h-8 rounded ${getStatusColor(bed.status)} cursor-pointer transform hover:scale-105 transition-all`}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-text-primary">
                  {bed.id}
                </div>
                {bed.patient && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-secondary whitespace-nowrap">
                    {bed.patient}
                  </div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {bed.id}: {getStatusLabel(bed.status)}
                {bed.patient && ` - ${bed.patient}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-text-primary">6/8</p>
            <p className="text-text-secondary text-xs">Occupied Beds</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-text-primary">75%</p>
            <p className="text-text-secondary text-xs">Occupancy Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanVisualization;