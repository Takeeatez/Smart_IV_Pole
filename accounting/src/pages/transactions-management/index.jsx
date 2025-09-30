import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';
import TransactionTable from './components/TransactionTable';
import TransactionFilters from './components/TransactionFilters';
import TransactionDetails from './components/TransactionDetails';
import BulkActions from './components/BulkActions';
import AddTransactionModal from './components/AddTransactionModal';

const TransactionsManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    account: 'all',
    type: 'all',
    status: 'all',
    search: ''
  });

  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@accountingpro.com",
    role: "staff"
  };

  // Mock transactions data
  const transactions = [
    {
      id: "TXN-001",
      date: "2024-01-15",
      description: "Office Supplies Purchase",
      account: "Office Expenses",
      accountCode: "6200",
      debit: 450.00,
      credit: 0,
      type: "expense",
      status: "reconciled",
      reference: "INV-2024-001",
      category: "Operating Expenses",
      bankFeed: false,
      attachments: 1
    },
    {
      id: "TXN-002",
      date: "2024-01-14",
      description: "Client Payment - ABC Corp",
      account: "Accounts Receivable",
      accountCode: "1200",
      debit: 0,
      credit: 2500.00,
      type: "income",
      status: "pending",
      reference: "PAY-2024-002",
      category: "Revenue",
      bankFeed: true,
      attachments: 0
    },
    {
      id: "TXN-003",
      date: "2024-01-13",
      description: "Bank Service Charges",
      account: "Bank Charges",
      accountCode: "6300",
      debit: 25.00,
      credit: 0,
      type: "expense",
      status: "review",
      reference: "BSC-2024-001",
      category: "Financial Expenses",
      bankFeed: true,
      attachments: 0
    },
    {
      id: "TXN-004",
      date: "2024-01-12",
      description: "Equipment Purchase",
      account: "Fixed Assets",
      accountCode: "1500",
      debit: 3200.00,
      credit: 0,
      type: "asset",
      status: "reconciled",
      reference: "EQ-2024-001",
      category: "Capital Expenditure",
      bankFeed: false,
      attachments: 2
    },
    {
      id: "TXN-005",
      date: "2024-01-11",
      description: "Utility Bill Payment",
      account: "Utilities",
      accountCode: "6400",
      debit: 180.00,
      credit: 0,
      type: "expense",
      status: "pending",
      reference: "UTL-2024-001",
      category: "Operating Expenses",
      bankFeed: true,
      attachments: 1
    }
  ];

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleTransactionSelect = (transactionIds) => {
    setSelectedTransactions(transactionIds);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on transactions:`, selectedTransactions);
    // Handle bulk actions
    setSelectedTransactions([]);
  };

  const handleAddTransaction = (transactionData) => {
    console.log('Adding new transaction:', transactionData);
    setShowAddModal(false);
  };

  const handleExport = () => {
    console.log('Exporting transactions...');
  };

  const handleImport = () => {
    console.log('Importing transactions...');
  };

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase()) &&
        !transaction.account.toLowerCase().includes(filters.search.toLowerCase()) &&
        !transaction.reference.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.account !== 'all' && transaction.account !== filters.account) return false;
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.status !== 'all' && transaction.status !== filters.status) return false;
    return true;
  });

  const stats = {
    total: filteredTransactions.length,
    reconciled: filteredTransactions.filter(t => t.status === 'reconciled').length,
    pending: filteredTransactions.filter(t => t.status === 'pending').length,
    review: filteredTransactions.filter(t => t.status === 'review').length,
    totalDebit: filteredTransactions.reduce((sum, t) => sum + t.debit, 0),
    totalCredit: filteredTransactions.reduce((sum, t) => sum + t.credit, 0)
  };

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
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  Transactions Management
                </h1>
                <p className="text-text-secondary">
                  Record, edit, and reconcile financial transactions
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition flex items-center space-x-2"
                >
                  <Icon name="Upload" size={16} color="#2c3e50" />
                  <span>Import</span>
                </button>
                
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition flex items-center space-x-2"
                >
                  <Icon name="Download" size={16} color="#2c3e50" />
                  <span>Export</span>
                </button>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition flex items-center space-x-2"
                >
                  <Icon name="Plus" size={16} color="white" />
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="FileText" size={16} color="#7f8c8d" />
                  <span className="text-sm text-text-secondary">Total</span>
                </div>
                <p className="text-xl font-semibold text-text-primary">{stats.total}</p>
              </div>
              
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="CheckCircle" size={16} color="#27ae60" />
                  <span className="text-sm text-text-secondary">Reconciled</span>
                </div>
                <p className="text-xl font-semibold text-success">{stats.reconciled}</p>
              </div>
              
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="Clock" size={16} color="#f39c12" />
                  <span className="text-sm text-text-secondary">Pending</span>
                </div>
                <p className="text-xl font-semibold text-warning">{stats.pending}</p>
              </div>
              
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="AlertCircle" size={16} color="#e74c3c" />
                  <span className="text-sm text-text-secondary">Review</span>
                </div>
                <p className="text-xl font-semibold text-error">{stats.review}</p>
              </div>
              
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="TrendingUp" size={16} color="#4a90a4" />
                  <span className="text-sm text-text-secondary">Total Debit</span>
                </div>
                <p className="text-lg font-semibold text-text-primary">${stats.totalDebit.toLocaleString()}</p>
              </div>
              
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="TrendingDown" size={16} color="#4a90a4" />
                  <span className="text-sm text-text-secondary">Total Credit</span>
                </div>
                <p className="text-lg font-semibold text-text-primary">${stats.totalCredit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <TransactionFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            resultCount={filteredTransactions.length}
          />

          {/* Bulk Actions */}
          {selectedTransactions.length > 0 && (
            <BulkActions 
              selectedCount={selectedTransactions.length}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedTransactions([])}
            />
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Transaction Table */}
            <div className={`${selectedTransaction ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
              <TransactionTable 
                transactions={filteredTransactions}
                selectedTransactions={selectedTransactions}
                onTransactionSelect={handleTransactionSelect}
                onTransactionClick={handleTransactionClick}
              />
            </div>

            {/* Transaction Details Panel */}
            {selectedTransaction && (
              <div className="xl:col-span-1">
                <TransactionDetails 
                  transaction={selectedTransaction}
                  onClose={() => setSelectedTransaction(null)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTransaction}
        />
      )}
    </div>
  );
};

export default TransactionsManagement;