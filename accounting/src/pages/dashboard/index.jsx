import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Components
import KPICard from './components/KPICard';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import PendingTasks from './components/PendingTasks';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState('staff'); // Mock user role

  // Mock user data
  const mockUser = {
    name: "Sarah Johnson",
    email: "sarah.johnson@accountingpro.com",
    role: "Senior Accountant",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  };

  // Mock KPI data
  const kpiData = [
    {
      id: 1,
      title: "Cash Flow",
      value: "$124,580",
      change: "+12.5%",
      trend: "up",
      icon: "TrendingUp",
      color: "success",
      description: "Current month vs previous"
    },
    {
      id: 2,
      title: "Outstanding Invoices",
      value: "$45,230",
      change: "-8.2%",
      trend: "down",
      icon: "FileText",
      color: "warning",
      description: "Pending client payments"
    },
    {
      id: 3,
      title: "Monthly Revenue",
      value: "$89,450",
      change: "+15.8%",
      trend: "up",
      icon: "DollarSign",
      color: "secondary",
      description: "Total revenue this month"
    },
    {
      id: 4,
      title: "Compliance Status",
      value: "98.5%",
      change: "+2.1%",
      trend: "up",
      icon: "Shield",
      color: "primary",
      description: "Tax compliance score"
    }
  ];

  // Mock chart data
  const revenueData = [
    { month: 'Jan', revenue: 65000, expenses: 45000, profit: 20000 },
    { month: 'Feb', revenue: 72000, expenses: 48000, profit: 24000 },
    { month: 'Mar', revenue: 68000, expenses: 52000, profit: 16000 },
    { month: 'Apr', revenue: 78000, expenses: 55000, profit: 23000 },
    { month: 'May', revenue: 85000, expenses: 58000, profit: 27000 },
    { month: 'Jun', revenue: 89450, expenses: 62000, profit: 27450 }
  ];

  const expenseData = [
    { category: 'Office Rent', amount: 15000, color: '#283593' },
    { category: 'Salaries', amount: 35000, color: '#2196F3' },
    { category: 'Software', amount: 8000, color: '#FF9800' },
    { category: 'Utilities', amount: 4000, color: '#4CAF50' },
    { category: 'Marketing', amount: 6000, color: '#FFC107' }
  ];

  const cashFlowData = [
    { date: '2024-01-01', inflow: 45000, outflow: 32000 },
    { date: '2024-01-08', inflow: 52000, outflow: 38000 },
    { date: '2024-01-15', inflow: 48000, outflow: 35000 },
    { date: '2024-01-22', inflow: 55000, outflow: 42000 },
    { date: '2024-01-29', inflow: 58000, outflow: 45000 }
  ];

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // Role-based content filtering
  const getRoleBasedKPIs = () => {
    switch (userRole) {
      case 'partner':
        return kpiData;
      case 'staff':
        return kpiData.slice(0, 3);
      case 'freelancer':
        return kpiData.filter(kpi => kpi.id !== 4);
      case 'client':
        return kpiData.slice(0, 2);
      default:
        return kpiData;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={mockUser} 
        onMenuToggle={handleSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        userRole={userRole}
      />

      <main className={`
        pt-header-height nav-transition
        ${sidebarCollapsed ? 'lg:ml-sidebar-collapsed' : 'lg:ml-sidebar-width'}
      `}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-heading font-bold text-text-primary mb-2">
                  Dashboard
                </h1>
                <p className="text-text-secondary text-lg">
                  Welcome back, {mockUser.name}. Here's your financial overview for today.
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-text-secondary bg-surface px-4 py-2 rounded-xl border border-border">
                  <Icon name="Calendar" size={16} color="#757575" />
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
                <button className="gradient-primary text-white px-6 py-2.5 rounded-xl hover:shadow-card-hover nav-transition flex items-center space-x-2 font-medium">
                  <Icon name="Download" size={16} color="white" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {getRoleBasedKPIs().map((kpi) => (
              <KPICard key={kpi.id} data={kpi} />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trends */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-text-primary">Revenue Trends</h3>
                  <p className="text-sm text-text-secondary">Monthly revenue, expenses, and profit overview</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-background nav-transition">
                    <Icon name="MoreHorizontal" size={16} color="#757575" />
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="month" stroke="#757575" fontSize={12} />
                    <YAxis stroke="#757575" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E0E0E0',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#283593" 
                      strokeWidth={3}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#FF9800" 
                      strokeWidth={2}
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-text-primary">Expense Breakdown</h3>
                  <p className="text-sm text-text-secondary">Current month expense categories</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-background nav-transition">
                    <Icon name="MoreHorizontal" size={16} color="#757575" />
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E0E0E0',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cash Flow Chart */}
          <div className="bg-surface rounded-xl border border-border p-6 mb-8 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-heading font-semibold text-text-primary">Cash Flow Analysis</h3>
                <p className="text-sm text-text-secondary">Weekly cash inflow vs outflow trends</p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-border rounded-xl px-4 py-2 bg-surface text-text-primary font-medium">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last 6 months</option>
                </select>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="date" stroke="#757575" fontSize={12} />
                  <YAxis stroke="#757575" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E0E0E0',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="inflow" 
                    stackId="1"
                    stroke="#4CAF50" 
                    fill="#4CAF50"
                    fillOpacity={0.6}
                    name="Cash Inflow"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="outflow" 
                    stackId="2"
                    stroke="#F44336" 
                    fill="#F44336"
                    fillOpacity={0.6}
                    name="Cash Outflow"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="xl:col-span-2">
              <RecentActivity userRole={userRole} />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <QuickActions userRole={userRole} />
              <PendingTasks userRole={userRole} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;