import React from 'react';
import Icon from 'components/AppIcon';

const PatientTable = ({ patients, selectedPatients, onPatientSelect, onPatientView }) => {
  const handleSelectAll = (checked) => {
    if (checked) {
      onPatientSelect(patients?.map(p => p?.id));
    } else {
      onPatientSelect([]);
    }
  };

  const handleSelectPatient = (patientId, checked) => {
    if (checked) {
      onPatientSelect([...selectedPatients, patientId]);
    } else {
      onPatientSelect(selectedPatients?.filter(id => id !== patientId));
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-600 border border-red-200';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-600 border border-yellow-200';
      case 'stable':
        return 'bg-green-100 text-green-600 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-600';
      case 'medium':
        return 'bg-yellow-50 text-yellow-600';
      case 'low':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysAdmitted = (admissionDate) => {
    const today = new Date();
    const admission = new Date(admissionDate);
    const diffTime = Math.abs(today - admission);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-background border-b border-border">
          <tr>
            <th className="px-4 py-4 text-left">
              <input
                type="checkbox"
                className="rounded border-border text-primary focus:ring-primary"
                checked={selectedPatients?.length === patients?.length && patients?.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Patient</th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Room</th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Admission</th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Diagnosis</th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Physician</th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Status</th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Priority</th>
            <th className="px-4 py-4 text-left text-sm font-medium text-text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {patients?.map((patient) => (
            <tr key={patient?.id} className="hover:bg-background transition-colors">
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                  checked={selectedPatients?.includes(patient?.id)}
                  onChange={(e) => handleSelectPatient(patient?.id, e.target.checked)}
                />
              </td>
              
              <td className="px-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {patient?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{patient?.name}</p>
                    <p className="text-sm text-text-secondary">{patient?.patientId}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs text-text-secondary">
                        {patient?.age}y • {patient?.gender} • {patient?.bloodType}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex items-center space-x-2">
                  <Icon name="MapPin" size={14} color="#6B7280" />
                  <div>
                    <p className="font-medium text-text-primary">{patient?.room}</p>
                    <p className="text-sm text-text-secondary">{patient?.ward}</p>
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div>
                  <p className="font-medium text-text-primary">{formatDate(patient?.admissionDate)}</p>
                  <p className="text-sm text-text-secondary">{getDaysAdmitted(patient?.admissionDate)} days ago</p>
                </div>
              </td>
              
              <td className="px-4 py-4">
                <p className="font-medium text-text-primary">{patient?.primaryDiagnosis}</p>
                {patient?.allergies?.length > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Icon name="AlertTriangle" size={12} color="#F59E0B" />
                    <span className="text-xs text-warning">Allergies: {patient?.allergies?.join(', ')}</span>
                  </div>
                )}
              </td>
              
              <td className="px-4 py-4">
                <p className="text-text-primary">{patient?.attendingPhysician}</p>
              </td>
              
              <td className="px-4 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(patient?.status)}`}>
                  {patient?.status}
                </span>
              </td>
              
              <td className="px-4 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(patient?.priority)}`}>
                  {patient?.priority}
                </span>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPatientView(patient)}
                    className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Icon name="Eye" size={16} color="currentColor" />
                  </button>
                  
                  <button className="p-1.5 text-text-secondary hover:text-secondary hover:bg-secondary-50 rounded-lg transition-all"
                    title="Edit Patient"
                  >
                    <Icon name="Edit" size={16} color="currentColor" />
                  </button>
                  
                  <button className="p-1.5 text-text-secondary hover:text-success hover:bg-green-50 rounded-lg transition-all"
                    title="Medical Records"
                  >
                    <Icon name="FileText" size={16} color="currentColor" />
                  </button>
                  
                  <div className="relative group">
                    <button className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-all">
                      <Icon name="MoreVertical" size={16} color="currentColor" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg shadow-floating border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-dropdown">
                      <div className="py-2">
                        <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background flex items-center space-x-2">
                          <Icon name="ArrowRightLeft" size={14} color="currentColor" />
                          <span>Transfer Patient</span>
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background flex items-center space-x-2">
                          <Icon name="UserCheck" size={14} color="currentColor" />
                          <span>Discharge</span>
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background flex items-center space-x-2">
                          <Icon name="Pill" size={14} color="currentColor" />
                          <span>Medications</span>
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background flex items-center space-x-2">
                          <Icon name="Activity" size={14} color="currentColor" />
                          <span>Vital Signs</span>
                        </button>
                        <div className="border-t border-border my-1"></div>
                        <button className="w-full px-4 py-2 text-left text-sm text-error hover:bg-red-50 flex items-center space-x-2">
                          <Icon name="Trash2" size={14} color="#EF4444" />
                          <span>Delete Record</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {patients?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Users" size={32} color="#6B7280" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No patients found</h3>
          <p className="text-text-secondary">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default PatientTable;