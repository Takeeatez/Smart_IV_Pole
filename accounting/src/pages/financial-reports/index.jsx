import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';
import ReportCard from './components/ReportCard';
import ReportViewer from './components/ReportViewer';
import ReportFilters from './components/ReportFilters';
import ExportOptions from './components/ExportOptions';

const FinancialReports = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'current-month',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    comparisonPeriod: 'previous-period',
    accountFilter: 'all',
    format: 'summary'
  });
  const [loading, setLoading] = useState(false);

  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@accountingpro.com",
    role: "Partner",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  };

  // Mock report categories and types
  const reportCategories = [
    {
      id: 'financial-statements',
      name: 'Financial Statements',
      icon: 'FileText',
      reports: [
        {
          id: 'profit-loss',
          name: 'Profit & Loss Statement',
          description: 'Income and expenses for the selected period',
          thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
          frequency: 'Monthly',
          lastGenerated: '2024-01-15'
        },
        {
          id: 'balance-sheet',
          name: 'Balance Sheet',
          description: 'Assets, liabilities, and equity snapshot',
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
          frequency: 'Monthly',
          lastGenerated: '2024-01-15'
        },
        {
          id: 'cash-flow',
          name: 'Cash Flow Statement',
          description: 'Cash inflows and outflows analysis',
          thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=200&fit=crop',
          frequency: 'Monthly',
          lastGenerated: '2024-01-15'
        }
      ]
    },
    {
      id: 'management-reports',
      name: 'Management Reports',
      icon: 'TrendingUp',
      reports: [
        {
          id: 'trial-balance',
          name: 'Trial Balance',
          description: 'Account balances verification report',
          thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
          frequency: 'Monthly',
          lastGenerated: '2024-01-15'
        },
        {
          id: 'variance-analysis',
          name: 'Variance Analysis',
          description: 'Budget vs actual performance comparison',
          thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop',
          frequency: 'Monthly',
          lastGenerated: '2024-01-14'
        },
        {
          id: 'aging-report',
          name: 'Accounts Aging Report',
          description: 'Outstanding receivables and payables aging',
          thumbnail: 'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=300&h=200&fit=crop',
          frequency: 'Weekly',
          lastGenerated: '2024-01-12'
        }
      ]
    },
    {
      id: 'tax-reports',
      name: 'Tax & Compliance',
      icon: 'Calculator',
      reports: [
        {
          id: 'gst-summary',
          name: 'GST Summary Report',
          description: 'Goods and Services Tax summary',
          thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop',
          frequency: 'Monthly',
          lastGenerated: '2024-01-15'
        },
        {
          id: 'tax-liability',
          name: 'Tax Liability Report',
          description: 'Current tax obligations and payments',
          thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=200&fit=crop',
          frequency: 'Quarterly',
          lastGenerated: '2024-01-01'
        }
      ]
    }
  ];

  // Mock report data generator
  const generateMockReportData = (reportId) => {
    const baseData = {
      'profit-loss': {
        title: 'Profit & Loss Statement',
        period: `${filters.startDate} to ${filters.endDate}`,
        sections: [
          {
            name: 'Revenue',
            items: [
              { account: 'Sales Revenue', amount: 125000, percentage: 100 },
              { account: 'Service Revenue', amount: 35000, percentage: 28 },
              { account: 'Other Income', amount: 2500, percentage: 2 }
            ],
            total: 162500
          },
          {
            name: 'Cost of Goods Sold',
            items: [
              { account: 'Direct Materials', amount: -45000, percentage: -36 },
              { account: 'Direct Labor', amount: -25000, percentage: -20 },
              { account: 'Manufacturing Overhead', amount: -8000, percentage: -6.4 }
            ],
            total: -78000
          },
          {
            name: 'Operating Expenses',
            items: [
              { account: 'Salaries & Wages', amount: -35000, percentage: -28 },
              { account: 'Rent Expense', amount: -12000, percentage: -9.6 },
              { account: 'Utilities', amount: -3500, percentage: -2.8 },
              { account: 'Marketing', amount: -8000, percentage: -6.4 },
              { account: 'Professional Services', amount: -4500, percentage: -3.6 }
            ],
            total: -63000
          }
        ],
        netIncome: 21500,
        chartData: [
          { name: 'Revenue', value: 162500, color: '#27ae60' },
          { name: 'COGS', value: 78000, color: '#e74c3c' },
          { name: 'Operating Expenses', value: 63000, color: '#f39c12' },
          { name: 'Net Income', value: 21500, color: '#3498db' }
        ]
      },
      'balance-sheet': {
        title: 'Balance Sheet',
        period: `As of ${filters.endDate}`,
        sections: [
          {
            name: 'Assets',
            subsections: [
              {
                name: 'Current Assets',
                items: [
                  { account: 'Cash and Cash Equivalents', amount: 45000 },
                  { account: 'Accounts Receivable', amount: 32000 },
                  { account: 'Inventory', amount: 28000 },
                  { account: 'Prepaid Expenses', amount: 5000 }
                ],
                total: 110000
              },
              {
                name: 'Non-Current Assets',
                items: [
                  { account: 'Property, Plant & Equipment', amount: 150000 },
                  { account: 'Accumulated Depreciation', amount: -35000 },
                  { account: 'Intangible Assets', amount: 25000 }
                ],
                total: 140000
              }
            ],
            total: 250000
          },
          {
            name: 'Liabilities',
            subsections: [
              {
                name: 'Current Liabilities',
                items: [
                  { account: 'Accounts Payable', amount: 18000 },
                  { account: 'Short-term Debt', amount: 15000 },
                  { account: 'Accrued Expenses', amount: 8000 }
                ],
                total: 41000
              },
              {
                name: 'Non-Current Liabilities',
                items: [
                  { account: 'Long-term Debt', amount: 85000 },
                  { account: 'Deferred Tax Liability', amount: 12000 }
                ],
                total: 97000
              }
            ],
            total: 138000
          },
          {
            name: 'Equity',
            items: [
              { account: 'Share Capital', amount: 75000 },
              { account: 'Retained Earnings', amount: 37000 }
            ],
            total: 112000
          }
        ]
      },
      'cash-flow': {
        title: 'Cash Flow Statement',
        period: `${filters.startDate} to ${filters.endDate}`,
        sections: [
          {
            name: 'Operating Activities',
            items: [
              { account: 'Net Income', amount: 21500 },
              { account: 'Depreciation', amount: 5000 },
              { account: 'Changes in Accounts Receivable', amount: -3000 },
              { account: 'Changes in Inventory', amount: -2000 },
              { account: 'Changes in Accounts Payable', amount: 2500 }
            ],
            total: 24000
          },
          {
            name: 'Investing Activities',
            items: [
              { account: 'Purchase of Equipment', amount: -15000 },
              { account: 'Sale of Investments', amount: 5000 }
            ],
            total: -10000
          },
          {
            name: 'Financing Activities',
            items: [
              { account: 'Loan Proceeds', amount: 20000 },
              { account: 'Loan Repayments', amount: -8000 },
              { account: 'Dividends Paid', amount: -5000 }
            ],
            total: 7000
          }
        ],
        netCashFlow: 21000,
        beginningCash: 24000,
        endingCash: 45000
      }
    };

    return baseData[reportId] || null;
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const data = generateMockReportData(report.id);
      setReportData(data);
      setLoading(false);
    }, 1000);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (selectedReport) {
      setLoading(true);
      setTimeout(() => {
        const data = generateMockReportData(selectedReport.id);
        setReportData(data);
        setLoading(false);
      }, 500);
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting ${selectedReport?.name} as ${format}`);
    // Export logic would go here
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  useEffect(() => {
    // Auto-select first report on load
    if (reportCategories.length > 0 && reportCategories[0].reports.length > 0) {
      handleReportSelect(reportCategories[0].reports[0]);
    }
  }, []);

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
        userRole={user.role.toLowerCase()}
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
                <h1 className="text-3xl font-heading font-bold text-text-primary">Financial Reports</h1>
                <p className="text-text-secondary mt-1">
                  Generate comprehensive financial statements and management reports
                </p>
              </div>
              
              {selectedReport && (
                <ExportOptions 
                  reportName={selectedReport.name}
                  onExport={handleExport}
                />
              )}
            </div>

            {/* Report Filters */}
            <ReportFilters 
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Report Selection Panel */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-surface rounded-lg border border-border p-6">
                <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                  Report Categories
                </h2>
                
                <div className="space-y-6">
                  {reportCategories.map((category) => (
                    <div key={category.id}>
                      <div className="flex items-center space-x-2 mb-3">
                        <Icon name={category.icon} size={18} color="var(--color-primary)" />
                        <h3 className="font-medium text-text-primary">{category.name}</h3>
                      </div>
                      
                      <div className="space-y-2 ml-6">
                        {category.reports.map((report) => (
                          <ReportCard
                            key={report.id}
                            report={report}
                            isSelected={selectedReport?.id === report.id}
                            onClick={() => handleReportSelect(report)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Viewer */}
            <div className="col-span-12 lg:col-span-9">
              {selectedReport ? (
                <ReportViewer
                  report={selectedReport}
                  data={reportData}
                  loading={loading}
                  filters={filters}
                />
              ) : (
                <div className="bg-surface rounded-lg border border-border p-12 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="FileText" size={32} color="var(--color-primary)" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                    Select a Report
                  </h3>
                  <p className="text-text-secondary">
                    Choose a report from the categories on the left to view detailed financial data
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialReports;