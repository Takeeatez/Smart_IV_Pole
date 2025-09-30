import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from 'components/AppIcon';

const RevenueChart = () => {
  const revenueData = [
    { month: 'Jan', revenue: 32000, target: 35000 },
    { month: 'Feb', revenue: 28000, target: 35000 },
    { month: 'Mar', revenue: 41000, target: 35000 },
    { month: 'Apr', revenue: 38000, target: 35000 },
    { month: 'May', revenue: 45000, target: 35000 },
    { month: 'Jun', revenue: 42000, target: 35000 },
    { month: 'Jul', revenue: 48000, target: 35000 },
    { month: 'Aug', revenue: 52000, target: 35000 },
    { month: 'Sep', revenue: 47000, target: 35000 },
    { month: 'Oct', revenue: 51000, target: 35000 },
    { month: 'Nov', revenue: 49000, target: 35000 },
    { month: 'Dec', revenue: 55000, target: 35000 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-modal">
          <p className="font-medium text-text-primary mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">
            Revenue Trends
          </h3>
          <p className="text-sm text-text-secondary">Monthly revenue vs target</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-text-secondary">Actual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-sm text-text-secondary">Target</span>
          </div>
          <button className="p-2 hover:bg-background rounded-lg nav-transition">
            <Icon name="Download" size={16} color="var(--color-text-secondary)" />
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              name="Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="var(--color-secondary)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 3 }}
              name="Target"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-success">$547K</p>
          <p className="text-sm text-text-secondary">YTD Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-primary">$420K</p>
          <p className="text-sm text-text-secondary">YTD Target</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-accent">130%</p>
          <p className="text-sm text-text-secondary">Achievement</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;