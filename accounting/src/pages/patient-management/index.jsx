import React, { useState, useEffect } from 'react';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';
import PatientTable from './components/PatientTable';
import PatientFilters from './components/PatientFilters';
import PatientDetailsPanel from './components/PatientDetailsPanel';
import AddPatientModal from './components/AddPatientModal';
import BulkPatientActions from './components/BulkPatientActions';

const PatientManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    ward: 'all',
    status: 'all',
    condition: 'all',
    priority: 'all'
  });

  const [user] = useState({
    name: 'Nurse Sarah Johnson',
    role: 'Charge Nurse',
    email: 'sarah.johnson@hospital.com'
  });

  const [patients, setPatients] = useState([
    {
      id: 'P001',
      patientId: 'HSP-2024-001',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      room: 'A-101',
      ward: 'General Medicine',
      admissionDate: '2024-01-15',
      primaryDiagnosis: 'Hypertension',
      attendingPhysician: 'Dr. Williams',
      status: 'Critical',
      priority: 'High',
      bloodType: 'O+',
      allergies: ['Penicillin'],
      emergencyContact: {
        name: 'Mary Smith',
        relationship: 'Spouse',
        phone: '+1 (555) 123-4567'
      },
      vitals: {
        heartRate: 95,
        bloodPressure: '140/90',
        temperature: 38.2,
        oxygenSaturation: 94
      },
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' }
      ],
      notes: 'Patient requires frequent vital sign monitoring. Blood pressure elevated.'
    },
    {
      id: 'P002',
      patientId: 'HSP-2024-002',
      name: 'Maria Garcia',
      age: 32,
      gender: 'Female',
      room: 'B-205',
      ward: 'Surgery',
      admissionDate: '2024-01-16',
      primaryDiagnosis: 'Appendectomy',
      attendingPhysician: 'Dr. Johnson',
      status: 'Stable',
      priority: 'Medium',
      bloodType: 'A+',
      allergies: [],
      emergencyContact: {
        name: 'Carlos Garcia',
        relationship: 'Husband',
        phone: '+1 (555) 234-5678'
      },
      vitals: {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 37.1,
        oxygenSaturation: 98
      },
      medications: [
        { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 6 hours' },
        { name: 'Antibiotics', dosage: '500mg', frequency: 'Twice daily' }
      ],
      notes: 'Post-operative recovery progressing well. Pain managed with medication.'
    },
    {
      id: 'P003',
      patientId: 'HSP-2024-003',
      name: 'Robert Johnson',
      age: 67,
      gender: 'Male',
      room: 'A-103',
      ward: 'General Medicine',
      admissionDate: '2024-01-14',
      primaryDiagnosis: 'Diabetes Management',
      attendingPhysician: 'Dr. Davis',
      status: 'Monitoring',
      priority: 'Medium',
      bloodType: 'B+',
      allergies: ['Sulfa'],
      emergencyContact: {
        name: 'Linda Johnson',
        relationship: 'Daughter',
        phone: '+1 (555) 345-6789'
      },
      vitals: {
        heartRate: 88,
        bloodPressure: '130/85',
        temperature: 37.8,
        oxygenSaturation: 96
      },
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
        { name: 'Insulin', dosage: '10 units', frequency: 'Before meals' }
      ],
      notes: 'Blood glucose levels stabilizing. Diet and medication adjustments ongoing.'
    }
  ]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handlePatientSelect = (patientIds) => {
    setSelectedPatients(patientIds);
  };

  const handlePatientView = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsPanel(true);
  };

  const handleAddPatient = (newPatient) => {
    const patientWithId = {
      ...newPatient,
      id: `P${String(patients.length + 1).padStart(3, '0')}`,
      patientId: `HSP-2024-${String(patients.length + 1).padStart(3, '0')}`
    };
    setPatients([...patients, patientWithId]);
    setShowAddModal(false);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleBulkAction = (action, patientIds) => {
    console.log(`Performing ${action} on patients:`, patientIds);
    // Implement bulk actions logic here
    setSelectedPatients([]);
  };

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient?.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient?.room?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWard = filters.ward === 'all' || patient?.ward === filters.ward;
    const matchesStatus = filters.status === 'all' || patient?.status === filters.status;
    const matchesCondition = filters.condition === 'all' || patient?.primaryDiagnosis?.toLowerCase().includes(filters.condition.toLowerCase());
    const matchesPriority = filters.priority === 'all' || patient?.priority === filters.priority;

    return matchesSearch && matchesWard && matchesStatus && matchesCondition && matchesPriority;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} userRole="nurse" />
      
      <div className={`flex-1 flex flex-col nav-transition ${
        sidebarCollapsed ? 'lg:ml-sidebar-collapsed' : 'lg:ml-sidebar-width'
      }`}>
        <Header 
          user={user} 
          onMenuToggle={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="flex-1 overflow-auto pt-header-height">
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text-primary">Patient Management</h1>
                <p className="text-text-secondary mt-1">
                  Comprehensive patient care and medical record management
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Icon name="UserPlus" size={16} color="white" />
                  <span>New Admission</span>
                </button>
                
                <button className="px-4 py-2 bg-surface border border-border text-text-primary rounded-xl hover:bg-background transition-colors font-medium flex items-center space-x-2">
                  <Icon name="Download" size={16} color="currentColor" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Patients</p>
                    <p className="text-2xl font-bold text-text-primary">{patients?.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name="Users" size={24} color="#2563EB" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success">↑ 2</span>
                  <span className="text-text-secondary ml-1">from yesterday</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Critical Patients</p>
                    <p className="text-2xl font-bold text-error">1</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Icon name="AlertTriangle" size={24} color="#EF4444" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-error">Requires attention</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Admissions Today</p>
                    <p className="text-2xl font-bold text-text-primary">3</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icon name="UserPlus" size={24} color="#10B981" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success">+1</span>
                  <span className="text-text-secondary ml-1">from yesterday</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Pending Discharge</p>
                    <p className="text-2xl font-bold text-text-primary">2</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Icon name="UserCheck" size={24} color="#8B5CF6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-text-secondary">Ready for discharge</span>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <PatientFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalPatients={filteredPatients?.length}
            />

            {/* Bulk Actions */}
            {selectedPatients?.length > 0 && (
              <BulkPatientActions
                selectedCount={selectedPatients?.length}
                onBulkAction={handleBulkAction}
                selectedPatients={selectedPatients}
              />
            )}

            {/* Patient Table */}
            <div className="bg-surface rounded-xl shadow-card border border-border overflow-hidden">
              <PatientTable
                patients={filteredPatients}
                selectedPatients={selectedPatients}
                onPatientSelect={handlePatientSelect}
                onPatientView={handlePatientView}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Patient Details Panel */}
      {showDetailsPanel && selectedPatient && (
        <PatientDetailsPanel
          patient={selectedPatient}
          onClose={() => {
            setShowDetailsPanel(false);
            setSelectedPatient(null);
          }}
        />
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPatient}
        />
      )}
    </div>
  );
};

export default PatientManagement;