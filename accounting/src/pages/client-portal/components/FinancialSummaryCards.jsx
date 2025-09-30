import React from 'react';
import Icon from 'components/AppIcon';

const FinancialSummaryCards = () => {
  const summaryData = [
    {
      title: "Current Cash Position",
      amount: "$127,450.00",
      change: "+12.5%",
      changeType: "positive",
      icon: "Wallet",
      description: "Available cash balance"
    },
    {
      title: "Outstanding Invoices",
      amount: "$23,890.00",
      change: "-5.2%",
      changeType: "negative",
      icon: "FileText",
      description: "Pending client payments"
    },
    {
      title: "Monthly Revenue",
      amount: "$45,200.00",
      change: "+8.7%",
      changeType: "positive",
      icon: "TrendingUp",
      description: "This month\'s income"
    },
    {
      title: "Upcoming Payments",
      amount: "$8,750.00",
      change: "Due in 7 days",
      changeType: "neutral",
      icon: "Calendar",
      description: "Scheduled obligations"
    }
  ];

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive':
        return 'ArrowUp';
      case 'negative':
        return 'ArrowDown';
      default:
        return 'Clock';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {summaryData.map((item, index) => (
        <div key={index} className="bg-surface rounded-lg border border-border p-6 hover:shadow-card nav-transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon name={item.icon} size={24} color="var(--color-primary)" />
            </div>
            <div className={`flex items-center space-x-1 ${getChangeColor(item.changeType)}`}>
              <Icon name={getChangeIcon(item.changeType)} size={16} />
              <span className="text-sm font-medium">{item.change}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-heading font-bold text-text-primary mb-1">
              {item.amount}
            </h3>
            <p className="text-sm font-medium text-text-primary mb-1">{item.title}</p>
            <p className="text-xs text-text-secondary">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialSummaryCards;