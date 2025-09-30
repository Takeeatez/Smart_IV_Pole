import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const RegulatoryUpdates = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock regulatory updates data
  const updates = [
    {
      id: 1,
      title: 'GST Rate Changes Effective April 2024',
      category: 'gst',
      priority: 'high',
      date: '2024-03-28',
      source: 'CBIC Notification',
      summary: `The Central Board of Indirect Taxes and Customs (CBIC) has announced significant changes to GST rates effective from April 1, 2024. Key changes include:

• Reduction in GST rate on electric vehicles from 12% to 5%
• Increase in GST rate on luxury watches from 18% to 28%
• New HSN codes introduced for digital services
• Clarification on input tax credit for work-from-home expenses

These changes will impact tax calculations for affected categories. Please update your tax rate configurations accordingly.`,
      impact: 'medium',
      actionRequired: true,
      deadline: '2024-04-01'
    },
    {
      id: 2,
      title: 'E-way Bill Threshold Limit Revised',
      category: 'eway',
      priority: 'medium',
      date: '2024-03-25',
      source: 'GST Council',
      summary: `The GST Council has revised the threshold limit for mandatory e-way bill generation:

• New threshold increased from ₹50,000 to ₹1,00,000 for intra-state movement
• Inter-state movement threshold remains at ₹50,000
• Special provisions for perishable goods extended
• Enhanced validation checks for vehicle details

This change aims to reduce compliance burden for small businesses while maintaining proper tracking of goods movement.`,
      impact: 'low',
      actionRequired: false,
      deadline: null
    },
    {
      id: 3,
      title: 'TDS Rate Updates for FY 2024-25',
      category: 'tds',
      priority: 'high',
      date: '2024-03-20',
      source: 'Income Tax Department',
      summary: `The Income Tax Department has issued updated TDS rates for Financial Year 2024-25:

• TDS on salary increased by 0.5% across all slabs
• Professional fees TDS rate revised from 10% to 12%
• New TDS provisions for cryptocurrency transactions
• Enhanced reporting requirements for high-value transactions

All employers and businesses must implement these changes from April 1, 2024.`,
      impact: 'high',
      actionRequired: true,
      deadline: '2024-04-01'
    },
    {
      id: 4,
      title: 'Digital Signature Certificate Mandate',
      category: 'compliance',
      priority: 'medium',
      date: '2024-03-15',
      source: 'MCA Circular',
      summary: `The Ministry of Corporate Affairs (MCA) has mandated the use of Class 3 Digital Signature Certificates for all statutory filings:

• Mandatory for companies with turnover above ₹5 crores
• Phased implementation starting from April 2024
• Enhanced security features required
• Integration with government portals improved

This measure aims to strengthen the digital infrastructure and reduce fraudulent filings.`,
      impact: 'medium',
      actionRequired: true,
      deadline: '2024-06-30'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Updates', icon: 'Globe' },
    { id: 'gst', label: 'GST Updates', icon: 'Calculator' },
    { id: 'eway', label: 'E-way Bill', icon: 'Truck' },
    { id: 'tds', label: 'TDS Updates', icon: 'CreditCard' },
    { id: 'compliance', label: 'Compliance', icon: 'Shield' }
  ];

  const filteredUpdates = selectedCategory === 'all' 
    ? updates 
    : updates.filter(update => update.category === selectedCategory);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error-100 border-error-200';
      case 'medium': return 'text-warning bg-warning-100 border-warning-200';
      case 'low': return 'text-success bg-success-100 border-success-200';
      default: return 'text-text-secondary bg-primary-100 border-border';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg border nav-transition
              ${selectedCategory === category.id
                ? 'border-primary bg-primary text-white' :'border-border bg-surface text-text-primary hover:border-primary-200'
              }
            `}
          >
            <Icon 
              name={category.icon} 
              size={16} 
              color={selectedCategory === category.id ? 'white' : 'var(--color-text-primary)'} 
            />
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Updates Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">High Priority</h3>
            <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
            </div>
          </div>
          <p className="text-2xl font-bold text-error mb-2">
            {updates.filter(u => u.priority === 'high').length}
          </p>
          <p className="text-sm text-text-secondary">Require immediate action</p>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">Action Required</h3>
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckSquare" size={20} color="var(--color-warning)" />
            </div>
          </div>
          <p className="text-2xl font-bold text-warning mb-2">
            {updates.filter(u => u.actionRequired).length}
          </p>
          <p className="text-sm text-text-secondary">Updates need implementation</p>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">This Month</h3>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={20} color="var(--color-primary)" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary mb-2">{updates.length}</p>
          <p className="text-sm text-text-secondary">New regulatory updates</p>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.map((update) => (
          <div key={update.id} className="bg-surface rounded-lg border border-border overflow-hidden">
            {/* Update Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-heading font-semibold text-text-primary">
                      {update.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(update.priority)}`}>
                      {update.priority} priority
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} color="var(--color-text-secondary)" />
                      <span>{update.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Building" size={14} color="var(--color-text-secondary)" />
                      <span>{update.source}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="TrendingUp" size={14} color={getImpactColor(update.impact)} />
                      <span className={getImpactColor(update.impact)}>
                        {update.impact} impact
                      </span>
                    </div>
                  </div>
                </div>

                {update.actionRequired && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Icon name="Clock" size={16} color="var(--color-warning)" />
                    <span className="text-sm text-warning font-medium">
                      Due: {update.deadline}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Update Content */}
            <div className="p-6">
              <div className="prose prose-sm max-w-none text-text-primary mb-4">
                <p>{update.summary}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary-700 nav-transition">
                    <Icon name="ExternalLink" size={14} color="var(--color-primary)" />
                    <span>View Full Notification</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary nav-transition">
                    <Icon name="Download" size={14} color="var(--color-text-secondary)" />
                    <span>Download PDF</span>
                  </button>
                </div>

                {update.actionRequired && (
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition text-sm">
                    Mark as Implemented
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Settings */}
      <div className="bg-background rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Notification Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text-primary mb-3">Update Categories</h4>
            <div className="space-y-2">
              {categories.slice(1).map((category) => (
                <label key={category.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-sm text-text-primary">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">Delivery Method</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Email notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-text-primary">In-app notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-text-primary">SMS alerts for high priority</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegulatoryUpdates;