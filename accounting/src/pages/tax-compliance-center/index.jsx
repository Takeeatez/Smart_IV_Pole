import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import TaxCalculationModule from './components/TaxCalculationModule';
import ComplianceReports from './components/ComplianceReports';
import FilingStatus from './components/FilingStatus';
import RegulatoryUpdates from './components/RegulatoryUpdates';

const TaxComplianceCenter = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('calculations');

  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@accountingpro.com",
    role: "partner"
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const tabs = [
    {
      id: 'calculations',
      label: 'Tax Calculations',
      icon: 'Calculator',
      component: TaxCalculationModule
    },
    {
      id: 'reports',
      label: 'Compliance Reports',
      icon: 'FileText',
      component: ComplianceReports
    },
    {
      id: 'filing',
      label: 'Filing Status',
      icon: 'CheckCircle',
      component: FilingStatus
    },
    {
      id: 'updates',
      label: 'Regulatory Updates',
      icon: 'Bell',
      component: RegulatoryUpdates
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onMenuToggle={handleSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        userRole={user.role}
      />

      <main className={`
        pt-header-height nav-transition
        ${sidebarCollapsed ? 'lg:ml-sidebar-collapsed' : 'lg:ml-sidebar-width'}
      `}>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
                  Tax Compliance Center
                </h1>
                <p className="text-text-secondary">
                  Centralized GST/VAT calculations, e-way bill generation, and regulatory reporting
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-700 nav-transition">
                  <Icon name="Download" size={16} color="white" />
                  <span className="hidden sm:inline">Export Reports</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition">
                  <Icon name="Plus" size={16} color="white" />
                  <span className="hidden sm:inline">New Filing</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-surface rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Pending Filings</p>
                    <p className="text-2xl font-bold text-warning">3</p>
                  </div>
                  <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Icon name="Clock" size={24} color="var(--color-warning)" />
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Tax Liability</p>
                    <p className="text-2xl font-bold text-text-primary">₹2,45,680</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingUp" size={24} color="var(--color-primary)" />
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Input Credit</p>
                    <p className="text-2xl font-bold text-success">₹1,89,420</p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingDown" size={24} color="var(--color-success)" />
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Compliance Score</p>
                    <p className="text-2xl font-bold text-success">98%</p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <Icon name="Shield" size={24} color="var(--color-success)" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="border-b border-border">
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap nav-transition
                      ${activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-primary-50' :'text-text-secondary hover:text-text-primary hover:bg-background'
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

            {/* Tab Content */}
            <div className="p-6">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaxComplianceCenter;