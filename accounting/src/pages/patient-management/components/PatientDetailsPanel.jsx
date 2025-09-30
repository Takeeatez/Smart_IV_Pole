import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const PatientDetailsPanel = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'vitals', label: 'Vital Signs', icon: 'Activity' },
    { id: 'medications', label: 'Medications', icon: 'Pill' },
    { id: 'notes', label: 'Care Notes', icon: 'FileText' }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'monitoring':
        return 'text-yellow-600 bg-yellow-100';
      case 'stable':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Patient Basic Info */}
      <div className="bg-background p-4 rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary">Patient ID</p>
            <p className="font-medium text-text-primary">{patient?.patientId}</p>
          </div>
          <div>
            <p className="text-text-secondary">Age</p>
            <p className="font-medium text-text-primary">{patient?.age} years</p>
          </div>
          <div>
            <p className="text-text-secondary">Gender</p>
            <p className="font-medium text-text-primary">{patient?.gender}</p>
          </div>
          <div>
            <p className="text-text-secondary">Blood Type</p>
            <p className="font-medium text-text-primary">{patient?.bloodType}</p>
          </div>
          <div>
            <p className="text-text-secondary">Room</p>
            <p className="font-medium text-text-primary">{patient?.room}</p>
          </div>
          <div>
            <p className="text-text-secondary">Ward</p>
            <p className="font-medium text-text-primary">{patient?.ward}</p>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-background p-4 rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Medical Information</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-text-secondary">Primary Diagnosis</p>
            <p className="font-medium text-text-primary">{patient?.primaryDiagnosis}</p>
          </div>
          <div>
            <p className="text-text-secondary">Attending Physician</p>
            <p className="font-medium text-text-primary">{patient?.attendingPhysician}</p>
          </div>
          <div>
            <p className="text-text-secondary">Admission Date</p>
            <p className="font-medium text-text-primary">{formatDate(patient?.admissionDate)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Allergies</p>
            <p className="font-medium text-text-primary">
              {patient?.allergies?.length > 0 ? patient?.allergies?.join(', ') : 'None reported'}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-background p-4 rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Emergency Contact</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Name</span>
            <span className="font-medium text-text-primary">{patient?.emergencyContact?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Relationship</span>
            <span className="font-medium text-text-primary">{patient?.emergencyContact?.relationship}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Phone</span>
            <span className="font-medium text-text-primary">{patient?.emergencyContact?.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVitals = () => (
    <div className="space-y-4">
      <div className="bg-background p-4 rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Current Vital Signs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-surface rounded-lg">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Heart" size={16} color="#EF4444" />
            </div>
            <p className="text-xs text-text-secondary">Heart Rate</p>
            <p className="text-lg font-bold text-text-primary">{patient?.vitals?.heartRate}</p>
            <p className="text-xs text-text-secondary">bpm</p>
          </div>
          
          <div className="text-center p-3 bg-surface rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Thermometer" size={16} color="#2563EB" />
            </div>
            <p className="text-xs text-text-secondary">Temperature</p>
            <p className="text-lg font-bold text-text-primary">{patient?.vitals?.temperature}</p>
            <p className="text-xs text-text-secondary">°C</p>
          </div>
          
          <div className="text-center p-3 bg-surface rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Activity" size={16} color="#8B5CF6" />
            </div>
            <p className="text-xs text-text-secondary">Blood Pressure</p>
            <p className="text-lg font-bold text-text-primary">{patient?.vitals?.bloodPressure}</p>
            <p className="text-xs text-text-secondary">mmHg</p>
          </div>
          
          <div className="text-center p-3 bg-surface rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Zap" size={16} color="#10B981" />
            </div>
            <p className="text-xs text-text-secondary">SpO2</p>
            <p className="text-lg font-bold text-text-primary">{patient?.vitals?.oxygenSaturation}</p>
            <p className="text-xs text-text-secondary">%</p>
          </div>
        </div>
      </div>
      
      <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
        View Vital Signs History
      </button>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-4">
      <div className="bg-background p-4 rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Current Medications</h3>
        <div className="space-y-3">
          {patient?.medications?.map((medication, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Pill" size={16} color="#2563EB" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{medication?.name}</p>
                  <p className="text-sm text-text-secondary">{medication?.dosage}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">{medication?.frequency}</p>
                <p className="text-xs text-text-secondary">Active</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button className="w-full py-2 px-4 bg-secondary text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium">
        Medication Administration Record
      </button>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="bg-background p-4 rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Care Notes</h3>
        <div className="space-y-3">
          <div className="p-3 bg-surface rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-text-primary">Current Care Plan</p>
              <span className="text-xs text-text-secondary">Today, 2:30 PM</span>
            </div>
            <p className="text-sm text-text-primary">{patient?.notes}</p>
            <p className="text-xs text-text-secondary mt-2">- Nurse Sarah Johnson</p>
          </div>
          
          <div className="p-3 bg-surface rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-text-primary">Medication Response</p>
              <span className="text-xs text-text-secondary">Yesterday, 10:15 AM</span>
            </div>
            <p className="text-sm text-text-primary">Patient responding well to current medication regimen. Vital signs stable.</p>
            <p className="text-xs text-text-secondary mt-2">- Dr. Williams</p>
          </div>
        </div>
      </div>
      
      <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
        Add New Note
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'vitals':
        return renderVitals();
      case 'medications':
        return renderMedications();
      case 'notes':
        return renderNotes();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-end">
      <div className="w-full max-w-lg h-full bg-surface shadow-floating overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {patient?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-text-primary">{patient?.name}</h2>
                <p className="text-text-secondary">{patient?.patientId}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-colors"
            >
              <Icon name="X" size={20} color="currentColor" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient?.status)}`}>
              {patient?.status}
            </span>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="MapPin" size={14} color="currentColor" />
              <span>{patient?.room} - {patient?.ward}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-20 bg-surface border-b border-border px-6 z-10">
          <div className="flex space-x-1">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab?.id
                    ? 'text-primary bg-background border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background'
                }`}
              >
                <Icon name={tab?.icon} size={16} color="currentColor" />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-6">
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              Update Status
            </button>
            <button className="py-2 px-4 bg-background border border-border text-text-primary rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Transfer Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPanel;