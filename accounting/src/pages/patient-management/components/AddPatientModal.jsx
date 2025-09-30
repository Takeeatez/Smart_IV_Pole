import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AddPatientModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    room: '',
    ward: '',
    primaryDiagnosis: '',
    attendingPhysician: '',
    status: 'Stable',
    priority: 'Medium',
    bloodType: '',
    allergies: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const wardOptions = [
    'General Medicine',
    'Surgery', 
    'Pediatrics',
    'ICU',
    'Emergency'
  ];

  const genderOptions = ['Male', 'Female', 'Other'];
  const statusOptions = ['Critical', 'Monitoring', 'Stable'];
  const priorityOptions = ['High', 'Medium', 'Low'];
  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Valid age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.room.trim()) newErrors.room = 'Room number is required';
    if (!formData.ward) newErrors.ward = 'Ward is required';
    if (!formData.primaryDiagnosis.trim()) newErrors.primaryDiagnosis = 'Primary diagnosis is required';
    if (!formData.attendingPhysician.trim()) newErrors.attendingPhysician = 'Attending physician is required';
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!formData.emergencyContact.name.trim()) newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    if (!formData.emergencyContact.phone.trim()) newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        admissionDate: new Date().toISOString().split('T')[0],
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        vitals: {
          heartRate: 72,
          bloodPressure: '120/80',
          temperature: 36.8,
          oxygenSaturation: 98
        },
        medications: []
      };
      
      onSubmit(patientData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface rounded-xl shadow-floating overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold text-text-primary">New Patient Admission</h2>
              <p className="text-text-secondary mt-1">Enter patient information and medical details</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-colors"
            >
              <Icon name="X" size={24} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-background p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.name ? 'border-error' : 'border-border'
                  }`}
                  placeholder="Enter patient's full name"
                />
                {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.age ? 'border-error' : 'border-border'
                  }`}
                  placeholder="Age"
                  min="1"
                  max="120"
                />
                {errors.age && <p className="text-error text-xs mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.gender ? 'border-error' : 'border-border'
                  }`}
                >
                  <option value="">Select gender</option>
                  {genderOptions?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.gender && <p className="text-error text-xs mt-1">{errors.gender}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Blood Type *
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.bloodType ? 'border-error' : 'border-border'
                  }`}
                >
                  <option value="">Select blood type</option>
                  {bloodTypeOptions?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.bloodType && <p className="text-error text-xs mt-1">{errors.bloodType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Penicillin, Nuts, Latex"
                />
              </div>
            </div>
          </div>

          {/* Hospital Assignment */}
          <div className="bg-background p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Hospital Assignment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.room ? 'border-error' : 'border-border'
                  }`}
                  placeholder="e.g., A-101"
                />
                {errors.room && <p className="text-error text-xs mt-1">{errors.room}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Ward *
                </label>
                <select
                  value={formData.ward}
                  onChange={(e) => handleInputChange('ward', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.ward ? 'border-error' : 'border-border'
                  }`}
                >
                  <option value="">Select ward</option>
                  {wardOptions?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.ward && <p className="text-error text-xs mt-1">{errors.ward}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {statusOptions?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {priorityOptions?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-background p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Medical Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Primary Diagnosis *
                </label>
                <input
                  type="text"
                  value={formData.primaryDiagnosis}
                  onChange={(e) => handleInputChange('primaryDiagnosis', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.primaryDiagnosis ? 'border-error' : 'border-border'
                  }`}
                  placeholder="Enter primary diagnosis"
                />
                {errors.primaryDiagnosis && <p className="text-error text-xs mt-1">{errors.primaryDiagnosis}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Attending Physician *
                </label>
                <input
                  type="text"
                  value={formData.attendingPhysician}
                  onChange={(e) => handleInputChange('attendingPhysician', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.attendingPhysician ? 'border-error' : 'border-border'
                  }`}
                  placeholder="e.g., Dr. Smith"
                />
                {errors.attendingPhysician && <p className="text-error text-xs mt-1">{errors.attendingPhysician}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Initial Care Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                rows="3"
                placeholder="Enter initial care notes and observations..."
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-background p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Emergency Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors['emergencyContact.name'] ? 'border-error' : 'border-border'
                  }`}
                  placeholder="Full name"
                />
                {errors['emergencyContact.name'] && <p className="text-error text-xs mt-1">{errors['emergencyContact.name']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Spouse, Parent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                  className={`w-full px-4 py-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors['emergencyContact.phone'] ? 'border-error' : 'border-border'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors['emergencyContact.phone'] && <p className="text-error text-xs mt-1">{errors['emergencyContact.phone']}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-text-primary border border-border rounded-lg hover:bg-background transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Admit Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;