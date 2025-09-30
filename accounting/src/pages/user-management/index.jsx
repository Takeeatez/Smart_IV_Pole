import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';
import UserTable from './components/UserTable';
import UserDetailPanel from './components/UserDetailPanel';
import FilterToolbar from './components/FilterToolbar';
import BulkActions from './components/BulkActions';
import AddUserModal from './components/AddUserModal';
import AuditLogModal from './components/AuditLogModal';

const UserManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    permission: 'all',
    status: 'all'
  });

  // Mock user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "Partner",
      permissions: ["Full Access", "User Management", "Financial Reports", "Tax Compliance"],
      status: "Active",
      lastActivity: new Date(Date.now() - 300000),
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      phone: "+1 (555) 123-4567",
      department: "Management",
      joinDate: new Date("2022-01-15"),
      loginHistory: [
        { date: new Date(Date.now() - 300000), ip: "192.168.1.100", device: "Chrome on Windows" },
        { date: new Date(Date.now() - 86400000), ip: "192.168.1.100", device: "Chrome on Windows" }
      ],
      activityLog: [
        { action: "Updated client permissions", timestamp: new Date(Date.now() - 1800000) },
        { action: "Generated financial report", timestamp: new Date(Date.now() - 3600000) }
      ]
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@company.com",
      role: "Staff",
      permissions: ["Transaction Management", "Financial Reports", "Bank Reconciliation"],
      status: "Active",
      lastActivity: new Date(Date.now() - 1800000),
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      phone: "+1 (555) 234-5678",
      department: "Accounting",
      joinDate: new Date("2022-03-20"),
      loginHistory: [
        { date: new Date(Date.now() - 1800000), ip: "192.168.1.101", device: "Firefox on Mac" },
        { date: new Date(Date.now() - 172800000), ip: "192.168.1.101", device: "Firefox on Mac" }
      ],
      activityLog: [
        { action: "Reconciled bank transactions", timestamp: new Date(Date.now() - 7200000) },
        { action: "Updated transaction categories", timestamp: new Date(Date.now() - 10800000) }
      ]
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@freelance.com",
      role: "Freelancer",
      permissions: ["Transaction Management", "Financial Reports"],
      status: "Active",
      lastActivity: new Date(Date.now() - 3600000),
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      phone: "+1 (555) 345-6789",
      department: "External",
      joinDate: new Date("2023-06-10"),
      loginHistory: [
        { date: new Date(Date.now() - 3600000), ip: "203.0.113.45", device: "Safari on iPhone" },
        { date: new Date(Date.now() - 259200000), ip: "203.0.113.45", device: "Safari on iPhone" }
      ],
      activityLog: [
        { action: "Exported client report", timestamp: new Date(Date.now() - 14400000) },
        { action: "Updated transaction records", timestamp: new Date(Date.now() - 18000000) }
      ]
    },
    {
      id: 4,
      name: "David Thompson",
      email: "david.thompson@client.com",
      role: "Client",
      permissions: ["Client Portal", "View Reports"],
      status: "Inactive",
      lastActivity: new Date(Date.now() - 604800000),
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      phone: "+1 (555) 456-7890",
      department: "Client",
      joinDate: new Date("2023-01-05"),
      loginHistory: [
        { date: new Date(Date.now() - 604800000), ip: "198.51.100.23", device: "Chrome on Android" },
        { date: new Date(Date.now() - 1209600000), ip: "198.51.100.23", device: "Chrome on Android" }
      ],
      activityLog: [
        { action: "Downloaded financial statement", timestamp: new Date(Date.now() - 604800000) },
        { action: "Viewed dashboard", timestamp: new Date(Date.now() - 1209600000) }
      ]
    },
    {
      id: 5,
      name: "Lisa Wang",
      email: "lisa.wang@company.com",
      role: "Staff",
      permissions: ["Transaction Management", "Bank Reconciliation"],
      status: "Active",
      lastActivity: new Date(Date.now() - 7200000),
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      phone: "+1 (555) 567-8901",
      department: "Accounting",
      joinDate: new Date("2022-08-12"),
      loginHistory: [
        { date: new Date(Date.now() - 7200000), ip: "192.168.1.102", device: "Edge on Windows" },
        { date: new Date(Date.now() - 93600000), ip: "192.168.1.102", device: "Edge on Windows" }
      ],
      activityLog: [
        { action: "Completed bank reconciliation", timestamp: new Date(Date.now() - 21600000) },
        { action: "Processed bulk transactions", timestamp: new Date(Date.now() - 25200000) }
      ]
    }
  ]);

  const currentUser = {
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Partner"
  };

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleAddUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      lastActivity: new Date(),
      avatar: `https://randomuser.me/api/portraits/${userData.gender || 'men'}/${users.length + 1}.jpg`,
      joinDate: new Date(),
      loginHistory: [],
      activityLog: []
    };
    setUsers(prev => [...prev, newUser]);
    setShowAddUserModal(false);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setSelectedUser(updatedUser);
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on users:`, selectedUsers);
    // Implement bulk actions here
    setSelectedUsers([]);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={currentUser} 
        onMenuToggle={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        userRole="partner"
      />

      <main className={`pt-header-height nav-transition ${
        sidebarCollapsed ? 'lg:pl-sidebar-collapsed' : 'lg:pl-sidebar-width'
      }`}>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">User Management</h1>
                <p className="text-text-secondary">Manage team members, roles, and permissions across your organization</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                <button
                  onClick={() => setShowAuditLogModal(true)}
                  className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition flex items-center space-x-2"
                >
                  <Icon name="FileText" size={16} color="var(--color-text-primary)" />
                  <span>Audit Log</span>
                </button>
                
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition flex items-center space-x-2"
                >
                  <Icon name="UserPlus" size={16} color="white" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Users</p>
                    <p className="text-2xl font-bold text-text-primary">{users.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} color="var(--color-primary)" />
                  </div>
                </div>
              </div>
              
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Active Users</p>
                    <p className="text-2xl font-bold text-success">{users.filter(u => u.status === 'Active').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <Icon name="UserCheck" size={20} color="var(--color-success)" />
                  </div>
                </div>
              </div>
              
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Partners</p>
                    <p className="text-2xl font-bold text-accent">{users.filter(u => u.role === 'Partner').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <Icon name="Crown" size={20} color="var(--color-accent)" />
                  </div>
                </div>
              </div>
              
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Online Now</p>
                    <p className="text-2xl font-bold text-secondary">
                      {users.filter(u => Date.now() - u.lastActivity.getTime() < 900000).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Icon name="Wifi" size={20} color="var(--color-secondary)" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <FilterToolbar 
            filters={filters}
            onFiltersChange={setFilters}
            userCount={filteredUsers.length}
          />

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <BulkActions 
              selectedCount={selectedUsers.length}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedUsers([])}
            />
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* User Table */}
            <div className="xl:col-span-2">
              <UserTable 
                users={filteredUsers}
                selectedUsers={selectedUsers}
                onUserSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
                onUserClick={handleUserClick}
                selectedUser={selectedUser}
              />
            </div>

            {/* User Detail Panel */}
            <div className="xl:col-span-1">
              <UserDetailPanel 
                user={selectedUser}
                onUpdateUser={handleUpdateUser}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddUserModal && (
        <AddUserModal 
          onClose={() => setShowAddUserModal(false)}
          onAddUser={handleAddUser}
        />
      )}

      {showAuditLogModal && (
        <AuditLogModal 
          onClose={() => setShowAuditLogModal(false)}
          users={users}
        />
      )}
    </div>
  );
};

export default UserManagement;