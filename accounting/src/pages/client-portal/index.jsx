import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import RevenueChart from './components/RevenueChart';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import DocumentCenter from './components/DocumentCenter';
import CommunicationPanel from './components/CommunicationPanel';
import RecentTransactions from './components/RecentTransactions';
import InvoiceApproval from './components/InvoiceApproval';

const ClientPortal = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data for client
  const currentUser = {
    name: "Sarah Johnson",
    email: "sarah.johnson@techstartup.com",
    role: "client",
    company: "TechStartup Inc.",
    accountManager: "Michael Rodriguez"
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const tabs = [
    { id: 'overview', label: 'Financial Overview', icon: 'BarChart3' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'communication', label: 'Messages', icon: 'MessageSquare' },
    { id: 'invoices', label: 'Invoice Approval', icon: 'Receipt' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={currentUser} 
        onMenuToggle={handleSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        userRole={currentUser.role}
      />

      <main className={`
        pt-header-height nav-transition
        ${sidebarCollapsed ? 'lg:ml-sidebar-collapsed' : 'lg:ml-sidebar-width'}
      `}>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary mb-2">
                  Welcome back, {currentUser.name}
                </h1>
                <p className="text-text-secondary">
                  Your financial dashboard for {currentUser.company}
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Account Manager</p>
                  <p className="font-medium text-text-primary">{currentUser.accountManager}</p>
                </div>
                <button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-700 nav-transition flex items-center space-x-2">
                  <Icon name="Phone" size={16} color="white" />
                  <span>Contact</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-border">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm nav-transition
                      ${activeTab === tab.id
                        ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                      }
                    `}
                  >
                    <Icon 
                      name={tab.icon} 
                      size={16} 
                      color={activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)'} 
                    />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Financial Summary Cards */}
              <FinancialSummaryCards />

              {/* Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <RevenueChart />
                <ExpenseBreakdown />
              </div>

              {/* Recent Activity */}
              <RecentTransactions />
            </div>
          )}

          {activeTab === 'documents' && (
            <DocumentCenter />
          )}

          {activeTab === 'communication' && (
            <CommunicationPanel />
          )}

          {activeTab === 'invoices' && (
            <InvoiceApproval />
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;