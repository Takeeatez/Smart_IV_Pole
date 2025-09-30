import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const FilingStatus = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-Q1');

  // Mock filing status data
  const filingStatus = [
    {
      id: 1,
      returnType: 'GSTR-1',
      period: 'March 2024',
      dueDate: '2024-04-11',
      status: 'filed',
      filedDate: '2024-04-08',
      acknowledgmentNumber: 'ACK123456789',
      amount: 374400
    },
    {
      id: 2,
      returnType: 'GSTR-3B',
      period: 'March 2024',
      dueDate: '2024-04-20',
      status: 'pending',
      filedDate: null,
      acknowledgmentNumber: null,
      amount: 156200
    },
    {
      id: 3,
      returnType: 'TDS Return',
      period: 'Q4 2023-24',
      dueDate: '2024-04-30',
      status: 'overdue',
      filedDate: null,
      acknowledgmentNumber: null,
      amount: 89500
    },
    {
      id: 4,
      returnType: 'GSTR-1',
      period: 'February 2024',
      dueDate: '2024-03-11',
      status: 'filed',
      filedDate: '2024-03-09',
      acknowledgmentNumber: 'ACK987654321',
      amount: 298750
    }
  ];

  const upcomingDeadlines = [
    {
      returnType: 'GSTR-3B',
      period: 'March 2024',
      dueDate: '2024-04-20',
      daysLeft: 5,
      priority: 'high'
    },
    {
      returnType: 'TDS Return',
      period: 'Q4 2023-24',
      dueDate: '2024-04-30',
      daysLeft: 15,
      priority: 'medium'
    },
    {
      returnType: 'Annual Return',
      period: 'FY 2023-24',
      dueDate: '2024-07-31',
      daysLeft: 107,
      priority: 'low'
    }
  ];

  const auditTrail = [
    {
      id: 1,
      action: 'GSTR-1 Filed',
      user: 'Sarah Johnson',
      timestamp: '2024-04-08 14:30:00',
      details: 'Successfully filed GSTR-1 for March 2024',
      type: 'filing'
    },
    {
      id: 2,
      action: 'Tax Calculation Updated',
      user: 'Michael Chen',
      timestamp: '2024-04-07 11:15:00',
      details: 'Updated HSN code 84713000 tax rate',
      type: 'calculation'
    },
    {
      id: 3,
      action: 'E-way Bill Generated',
      user: 'Sarah Johnson',
      timestamp: '2024-04-06 16:45:00',
      details: 'Generated e-way bill #EWB123456789',
      type: 'eway'
    },
    {
      id: 4,
      action: 'Report Exported',
      user: 'David Wilson',
      timestamp: '2024-04-05 09:20:00',
      details: 'Exported GSTR-3B JSON for February 2024',
      type: 'export'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'filed': return 'text-success bg-success-100 border-success-200';
      case 'pending': return 'text-warning bg-warning-100 border-warning-200';
      case 'overdue': return 'text-error bg-error-100 border-error-200';
      default: return 'text-text-secondary bg-primary-100 border-border';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error-100';
      case 'medium': return 'text-warning bg-warning-100';
      case 'low': return 'text-success bg-success-100';
      default: return 'text-text-secondary bg-primary-100';
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'filing': return 'FileCheck';
      case 'calculation': return 'Calculator';
      case 'eway': return 'Truck';
      case 'export': return 'Download';
      default: return 'Activity';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">Filed Returns</h3>
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} color="var(--color-success)" />
            </div>
          </div>
          <p className="text-2xl font-bold text-success mb-2">8</p>
          <p className="text-sm text-text-secondary">This quarter</p>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">Pending Returns</h3>
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} color="var(--color-warning)" />
            </div>
          </div>
          <p className="text-2xl font-bold text-warning mb-2">3</p>
          <p className="text-sm text-text-secondary">Due this month</p>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">Compliance Score</h3>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} color="var(--color-primary)" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary mb-2">98%</p>
          <p className="text-sm text-text-secondary">Excellent rating</p>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-background rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Upcoming Deadlines
        </h3>
        
        <div className="space-y-3">
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(deadline.priority).split(' ')[1]}`}></div>
                  <div>
                    <h4 className="font-medium text-text-primary">{deadline.returnType}</h4>
                    <p className="text-sm text-text-secondary">{deadline.period}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-text-primary font-medium">Due: {deadline.dueDate}</p>
                  <p className={`text-sm font-medium ${
                    deadline.daysLeft <= 7 ? 'text-error' : 
                    deadline.daysLeft <= 15 ? 'text-warning' : 'text-success'
                  }`}>
                    {deadline.daysLeft} days left
                  </p>
                </div>
                
                <button className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition text-sm">
                  File Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filing Status Table */}
      <div className="bg-background rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-text-primary">
            Filing Status History
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:border-border-focus focus:outline-none nav-transition"
          >
            <option value="2024-Q1">Q1 2024</option>
            <option value="2023-Q4">Q4 2023</option>
            <option value="2023-Q3">Q3 2023</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Return Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Period</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Filed Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filingStatus.map((filing) => (
                <tr key={filing.id} className="border-b border-border hover:bg-primary-50 nav-transition">
                  <td className="py-3 px-4 text-sm font-medium text-text-primary">{filing.returnType}</td>
                  <td className="py-3 px-4 text-sm text-text-primary">{filing.period}</td>
                  <td className="py-3 px-4 text-sm text-text-primary">{filing.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(filing.status)}`}>
                      {filing.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {filing.filedDate || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary text-right">
                    ₹{filing.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {filing.status === 'filed' && (
                        <button className="text-primary hover:text-primary-700 nav-transition">
                          <Icon name="Download" size={16} color="var(--color-primary)" />
                        </button>
                      )}
                      <button className="text-text-secondary hover:text-text-primary nav-transition">
                        <Icon name="Eye" size={16} color="var(--color-text-secondary)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOX Compliance Audit Trail */}
      <div className="bg-background rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          SOX Compliance Audit Trail
        </h3>
        
        <div className="space-y-4">
          {auditTrail.map((entry) => (
            <div key={entry.id} className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={getActionIcon(entry.type)} size={16} color="var(--color-primary)" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-text-primary">{entry.action}</h4>
                    <span className="text-sm text-text-secondary">{entry.timestamp}</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{entry.details}</p>
                  <div className="flex items-center space-x-2">
                    <Icon name="User" size={14} color="var(--color-text-secondary)" />
                    <span className="text-xs text-text-secondary">by {entry.user}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-sm text-primary hover:text-primary-700 nav-transition font-medium">
            View Complete Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilingStatus;