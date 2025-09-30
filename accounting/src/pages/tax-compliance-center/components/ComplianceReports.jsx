import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ComplianceReports = () => {
  const [selectedReport, setSelectedReport] = useState('gstr1');
  const [reportPeriod, setReportPeriod] = useState('2024-03');

  // Mock compliance reports data
  const reports = [
    {
      id: 'gstr1',
      name: 'GSTR-1',
      description: 'Outward supplies of taxable goods and/or services',
      status: 'ready',
      lastGenerated: '2024-03-15',
      dueDate: '2024-04-11'
    },
    {
      id: 'gstr3b',
      name: 'GSTR-3B',
      description: 'Monthly return with summary of outward and inward supplies',
      status: 'pending',
      lastGenerated: '2024-02-15',
      dueDate: '2024-04-20'
    },
    {
      id: 'ewayBill',
      name: 'E-way Bill Summary',
      description: 'Summary of all e-way bills generated',
      status: 'ready',
      lastGenerated: '2024-03-20',
      dueDate: '2024-04-10'
    },
    {
      id: 'tds',
      name: 'TDS Returns',
      description: 'Tax Deducted at Source quarterly returns',
      status: 'draft',
      lastGenerated: '2024-01-15',
      dueDate: '2024-04-30'
    }
  ];

  const reportPeriods = [
    { value: '2024-03', label: 'March 2024' },
    { value: '2024-02', label: 'February 2024' },
    { value: '2024-01', label: 'January 2024' },
    { value: '2023-12', label: 'December 2023' }
  ];

  // Mock GSTR data
  const gstrData = {
    summary: {
      totalOutwardSupplies: 2450000,
      totalTaxableValue: 2080000,
      totalTaxAmount: 374400,
      totalInvoices: 156
    },
    hsn: [
      { code: '84713000', description: 'Portable computers', taxableValue: 850000, taxAmount: 153000, rate: 18 },
      { code: '85171200', description: 'Smartphones', taxableValue: 650000, taxAmount: 117000, rate: 18 },
      { code: '84716000', description: 'Input/output units', taxableValue: 380000, taxAmount: 68400, rate: 18 },
      { code: '85176200', description: 'Machines for reception', taxableValue: 200000, taxAmount: 36000, rate: 18 }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-success bg-success-100';
      case 'pending': return 'text-warning bg-warning-100';
      case 'draft': return 'text-text-secondary bg-primary-100';
      default: return 'text-text-secondary bg-primary-100';
    }
  };

  const handleExportJSON = () => {
    const jsonData = {
      gstin: "22AAAAA0000A1Z5",
      ret_period: reportPeriod,
      summary: gstrData.summary,
      hsn_data: gstrData.hsn,
      generated_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gstr-${selectedReport}-${reportPeriod}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Selection and Period */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Select Report Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`
                  p-4 rounded-lg border nav-transition text-left
                  ${selectedReport === report.id
                    ? 'border-primary bg-primary-50' :'border-border hover:border-primary-200'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-text-primary">{report.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{report.description}</p>
                <div className="mt-2 text-xs text-text-secondary">
                  Due: {report.dueDate}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Report Period
          </label>
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:border-border-focus focus:outline-none nav-transition"
          >
            {reportPeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          <div className="mt-4 p-4 bg-background rounded-lg">
            <h4 className="font-medium text-text-primary mb-2">Report Actions</h4>
            <div className="space-y-2">
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition"
              >
                <Icon name="Download" size={16} color="white" />
                <span>Export JSON</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-700 nav-transition">
                <Icon name="Send" size={16} color="white" />
                <span>File Return</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-background rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-text-primary">
            {reports.find(r => r.id === selectedReport)?.name} Preview
          </h3>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name="Calendar" size={16} color="var(--color-text-secondary)" />
            <span>Period: {reportPeriods.find(p => p.value === reportPeriod)?.label}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-lg p-4 border border-border">
            <p className="text-sm text-text-secondary mb-1">Total Outward Supplies</p>
            <p className="text-xl font-bold text-text-primary">₹{gstrData.summary.totalOutwardSupplies.toLocaleString()}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <p className="text-sm text-text-secondary mb-1">Taxable Value</p>
            <p className="text-xl font-bold text-text-primary">₹{gstrData.summary.totalTaxableValue.toLocaleString()}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <p className="text-sm text-text-secondary mb-1">Tax Amount</p>
            <p className="text-xl font-bold text-primary">₹{gstrData.summary.totalTaxAmount.toLocaleString()}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <p className="text-sm text-text-secondary mb-1">Total Invoices</p>
            <p className="text-xl font-bold text-text-primary">{gstrData.summary.totalInvoices}</p>
          </div>
        </div>

        {/* HSN Summary Table */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h4 className="font-medium text-text-primary">HSN Summary</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">HSN Code</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Description</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-text-secondary">Taxable Value</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-text-secondary">Rate (%)</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-text-secondary">Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {gstrData.hsn.map((item, index) => (
                  <tr key={index} className="border-b border-border hover:bg-background nav-transition">
                    <td className="py-3 px-6 text-sm font-data text-text-primary">{item.code}</td>
                    <td className="py-3 px-6 text-sm text-text-primary">{item.description}</td>
                    <td className="py-3 px-6 text-sm text-text-primary text-right">₹{item.taxableValue.toLocaleString()}</td>
                    <td className="py-3 px-6 text-sm text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium">
                        {item.rate}%
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-primary text-right font-medium">₹{item.taxAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      <div className="bg-success-100 border border-success-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Icon name="CheckCircle" size={20} color="var(--color-success)" />
          <div>
            <p className="text-success font-medium">Validation Passed</p>
            <p className="text-success-700 text-sm">All required fields are complete and data integrity checks passed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReports;