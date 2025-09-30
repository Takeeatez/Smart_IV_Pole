import React from 'react';
import Icon from 'components/AppIcon';

const VitalSignsMonitor = () => {
  const vitalSignsData = [
    {
      id: 1,
      patientName: 'John Smith',
      room: 'A-101',
      heartRate: 95,
      bloodPressure: '140/90',
      temperature: 38.2,
      oxygenSaturation: 94,
      status: 'critical'
    },
    {
      id: 2,
      patientName: 'Maria Garcia',
      room: 'B-205',
      heartRate: 72,
      bloodPressure: '120/80',
      temperature: 37.1,
      oxygenSaturation: 98,
      status: 'stable'
    },
    {
      id: 3,
      patientName: 'Robert Johnson',
      room: 'A-103',
      heartRate: 88,
      bloodPressure: '130/85',
      temperature: 37.8,
      oxygenSaturation: 96,
      status: 'monitoring'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'text-error bg-red-50 border-red-200';
      case 'monitoring':
        return 'text-warning bg-yellow-50 border-yellow-200';
      case 'stable':
        return 'text-success bg-green-50 border-green-200';
      default:
        return 'text-text-secondary bg-gray-50 border-gray-200';
    }
  };

  const getVitalStatus = (vital, type) => {
    switch (type) {
      case 'heartRate':
        if (vital > 100 || vital < 60) return 'critical';
        if (vital > 90 || vital < 70) return 'monitoring';
        return 'normal';
      case 'temperature':
        if (vital > 38.0 || vital < 36.0) return 'critical';
        if (vital > 37.5 || vital < 36.5) return 'monitoring';
        return 'normal';
      case 'oxygenSaturation':
        if (vital < 95) return 'critical';
        if (vital < 97) return 'monitoring';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getVitalColor = (status) => {
    switch (status) {
      case 'critical':
        return 'text-error';
      case 'monitoring':
        return 'text-warning';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Real-time Vital Signs</h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-text-secondary">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {vitalSignsData?.map((patient) => (
          <div 
            key={patient?.id} 
            className={`p-4 rounded-lg border ${getStatusColor(patient?.status)} transition-all hover:shadow-card`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-text-primary text-sm">{patient?.patientName}</h4>
                <p className="text-xs text-text-secondary">{patient?.room}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Activity" size={14} color="currentColor" />
                <span className="text-xs font-medium capitalize">{patient?.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Heart Rate</span>
                <span className={`font-medium ${getVitalColor(getVitalStatus(patient?.heartRate, 'heartRate'))}`}>
                  {patient?.heartRate} bpm
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Blood Pressure</span>
                <span className="font-medium text-text-primary">{patient?.bloodPressure}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Temperature</span>
                <span className={`font-medium ${getVitalColor(getVitalStatus(patient?.temperature, 'temperature'))}`}>
                  {patient?.temperature}°C
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">SpO2</span>
                <span className={`font-medium ${getVitalColor(getVitalStatus(patient?.oxygenSaturation, 'oxygenSaturation'))}`}>
                  {patient?.oxygenSaturation}%
                </span>
              </div>
            </div>

            {patient?.status === 'critical' && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <div className="flex items-center space-x-2 text-error">
                  <Icon name="AlertTriangle" size={12} color="#EF4444" />
                  <span className="font-medium">Requires immediate attention</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          View All Vital Signs
        </button>
      </div>
    </div>
  );
};

export default VitalSignsMonitor;