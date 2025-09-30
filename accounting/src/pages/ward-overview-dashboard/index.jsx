import React, { useState, useEffect } from 'react';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';
import WardStatusCard from './components/WardStatusCard';
import PatientStatusCard from './components/PatientStatusCard';
import FloorPlanVisualization from './components/FloorPlanVisualization';
import VitalSignsMonitor from './components/VitalSignsMonitor';
import EmergencyAlerts from './components/EmergencyAlerts';
import QuickActions from './components/QuickActions';

const WardOverviewDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedWard, setSelectedWard] = useState('all');
  const [currentShift, setCurrentShift] = useState('day');
  const [user] = useState({
    name: 'Nurse Sarah Johnson',
    role: 'Charge Nurse',
    email: 'sarah.johnson@hospital.com'
  });

  const wardData = [
    {
      id: 'ward-a',
      name: 'Ward A - General Medicine',
      totalBeds: 24,
      occupiedBeds: 18,
      availableBeds: 6,
      criticalPatients: 3,
      stablePatients: 12,
      monitoringPatients: 3,
      staffAssigned: 6,
      occupancyRate: 75
    },
    {
      id: 'ward-b', 
      name: 'Ward B - Surgery',
      totalBeds: 20,
      occupiedBeds: 16,
      availableBeds: 4,
      criticalPatients: 2,
      stablePatients: 10,
      monitoringPatients: 4,
      staffAssigned: 5,
      occupancyRate: 80
    },
    {
      id: 'ward-c',
      name: 'Ward C - Pediatrics',
      totalBeds: 18,
      occupiedBeds: 12,
      availableBeds: 6,
      criticalPatients: 1,
      stablePatients: 8,
      monitoringPatients: 3,
      staffAssigned: 4,
      occupancyRate: 67
    }
  ];

  const emergencyAlerts = [
    {
      id: 1,
      patientName: 'John Smith',
      room: 'A-101',
      alert: 'Critical vital signs',
      time: '2 minutes ago',
      priority: 'critical',
      type: 'vitals'
    },
    {
      id: 2,
      patientName: 'Maria Garcia',
      room: 'B-205',
      alert: 'Medication due',
      time: '5 minutes ago',
      priority: 'high',
      type: 'medication'
    },
    {
      id: 3,
      patientName: 'Robert Johnson',
      room: 'A-103',
      alert: 'Call button pressed',
      time: '8 minutes ago',
      priority: 'medium',
      type: 'assistance'
    }
  ];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
        
        <main className="flex-1 overflow-auto pt-header-height p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text-primary">Ward Overview Dashboard</h1>
                <p className="text-text-secondary mt-1">{currentTime}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="px-4 py-2 bg-surface border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Wards</option>
                  <option value="ward-a">Ward A - General Medicine</option>
                  <option value="ward-b">Ward B - Surgery</option>
                  <option value="ward-c">Ward C - Pediatrics</option>
                </select>
                
                <select
                  value={currentShift}
                  onChange={(e) => setCurrentShift(e.target.value)}
                  className="px-4 py-2 bg-surface border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="day">Day Shift (7AM-7PM)</option>
                  <option value="night">Night Shift (7PM-7AM)</option>
                </select>
              </div>
            </div>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Patients</p>
                    <p className="text-2xl font-bold text-text-primary">46</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name="Users" size={24} color="#2563EB" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success">↑ 3</span>
                  <span className="text-text-secondary ml-1">from yesterday</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Critical Patients</p>
                    <p className="text-2xl font-bold text-error">6</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Icon name="AlertTriangle" size={24} color="#EF4444" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-error">↑ 1</span>
                  <span className="text-text-secondary ml-1">from last shift</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Bed Occupancy</p>
                    <p className="text-2xl font-bold text-text-primary">74%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icon name="Bed" size={24} color="#10B981" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success">+2%</span>
                  <span className="text-text-secondary ml-1">from yesterday</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Staff On Duty</p>
                    <p className="text-2xl font-bold text-text-primary">15</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Icon name="UserCheck" size={24} color="#8B5CF6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-text-secondary">Full staffed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Ward Status Cards */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Ward Status</h2>
                <div className="space-y-4">
                  {wardData?.map((ward) => (
                    <WardStatusCard key={ward?.id} ward={ward} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <QuickActions />
            </div>

            {/* Center Column - Floor Plan & Vital Signs */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Floor Plan Overview</h2>
                <FloorPlanVisualization selectedWard={selectedWard} />
              </div>

              <div>
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Vital Signs Monitor</h2>
                <VitalSignsMonitor />
              </div>
            </div>

            {/* Right Column - Emergency Alerts & Patient Status */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Emergency Alerts</h2>
                <EmergencyAlerts alerts={emergencyAlerts} />
              </div>

              <div>
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Patient Status Summary</h2>
                <div className="space-y-4">
                  <PatientStatusCard
                    status="critical"
                    count={6}
                    label="Critical Patients"
                    color="red"
                  />
                  <PatientStatusCard
                    status="monitoring"
                    count={10}
                    label="Under Monitoring"
                    color="yellow"
                  />
                  <PatientStatusCard
                    status="stable"
                    count={30}
                    label="Stable Patients"
                    color="green"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Recent Activities */}
          <div className="mt-8">
            <div className="bg-surface rounded-xl p-6 shadow-card border border-border">
              <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Recent Activities</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="UserCheck" size={16} color="#10B981" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Patient discharge completed</p>
                    <p className="text-xs text-text-secondary">Room A-205 • 15 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="Plus" size={16} color="#2563EB" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">New patient admission</p>
                    <p className="text-xs text-text-secondary">Room B-103 • 32 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon name="FileText" size={16} color="#8B5CF6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Medication round completed</p>
                    <p className="text-xs text-text-secondary">Ward A • 45 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WardOverviewDashboard;