import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const TransactionTable = ({ 
  transactions, 
  selectedTransactions, 
  onTransactionSelect, 
  onTransactionClick 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onTransactionSelect(transactions.map(t => t.id));
    } else {
      onTransactionSelect([]);
    }
  };

  const handleSelectTransaction = (transactionId, checked) => {
    if (checked) {
      onTransactionSelect([...selectedTransactions, transactionId]);
    } else {
      onTransactionSelect(selectedTransactions.filter(id => id !== transactionId));
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reconciled':
        return <Icon name="CheckCircle" size={16} color="#27ae60" />;
      case 'pending':
        return <Icon name="Clock" size={16} color="#f39c12" />;
      case 'review':
        return <Icon name="AlertCircle" size={16} color="#e74c3c" />;
      default:
        return <Icon name="Circle" size={16} color="#7f8c8d" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      reconciled: 'bg-success-100 text-success-700',
      pending: 'bg-warning-100 text-warning-700',
      review: 'bg-error-100 text-error-700'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <Icon name="ArrowUpDown" size={14} color="#7f8c8d" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} color="#2c3e50" />
      : <Icon name="ArrowDown" size={14} color="#2c3e50" />;
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-border focus:ring-2 focus:ring-border-focus"
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-primary-50 nav-transition"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-2">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-primary-50 nav-transition"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center space-x-2">
                  <span>Description</span>
                  {getSortIcon('description')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-primary-50 nav-transition"
                onClick={() => handleSort('account')}
              >
                <div className="flex items-center space-x-2">
                  <span>Account</span>
                  {getSortIcon('account')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-medium text-text-primary cursor-pointer hover:bg-primary-50 nav-transition"
                onClick={() => handleSort('debit')}
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Debit</span>
                  {getSortIcon('debit')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-medium text-text-primary cursor-pointer hover:bg-primary-50 nav-transition"
                onClick={() => handleSort('credit')}
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Credit</span>
                  {getSortIcon('credit')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-text-primary">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedTransactions.map((transaction) => (
              <tr 
                key={transaction.id}
                className={`hover:bg-background nav-transition cursor-pointer ${
                  selectedTransactions.includes(transaction.id) ? 'bg-primary-50' : ''
                }`}
                onClick={() => onTransactionClick(transaction)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={(e) => handleSelectTransaction(transaction.id, e.target.checked)}
                    className="rounded border-border focus:ring-2 focus:ring-border-focus"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-text-primary">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{transaction.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-text-secondary">{transaction.reference}</span>
                      {transaction.bankFeed && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-secondary-100 text-secondary-700">
                          <Icon name="Building2" size={10} color="#0e7490" className="mr-1" />
                          Bank Feed
                        </span>
                      )}
                      {transaction.attachments > 0 && (
                        <span className="inline-flex items-center text-xs text-text-secondary">
                          <Icon name="Paperclip" size={10} color="#7f8c8d" className="mr-1" />
                          {transaction.attachments}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{transaction.account}</p>
                    <p className="text-xs text-text-secondary">{transaction.accountCode}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-text-primary">
                  {transaction.debit > 0 ? `$${transaction.debit.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-text-primary">
                  {transaction.credit > 0 ? `$${transaction.credit.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(transaction.status)}
                </td>
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center space-x-2">
                    <button className="p-1 rounded hover:bg-primary-100 nav-transition">
                      <Icon name="Edit" size={14} color="#7f8c8d" />
                    </button>
                    <button className="p-1 rounded hover:bg-primary-100 nav-transition">
                      <Icon name="MoreHorizontal" size={14} color="#7f8c8d" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden">
        {paginatedTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className={`p-4 border-b border-border last:border-b-0 ${
              selectedTransactions.includes(transaction.id) ? 'bg-primary-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedTransactions.includes(transaction.id)}
                  onChange={(e) => handleSelectTransaction(transaction.id, e.target.checked)}
                  className="rounded border-border focus:ring-2 focus:ring-border-focus"
                />
                <div>
                  <p className="font-medium text-text-primary">{transaction.description}</p>
                  <p className="text-sm text-text-secondary">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
              {getStatusBadge(transaction.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-text-secondary mb-1">Account</p>
                <p className="text-sm font-medium text-text-primary">{transaction.account}</p>
                <p className="text-xs text-text-secondary">{transaction.accountCode}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Amount</p>
                <p className="text-sm font-medium text-text-primary">
                  {transaction.debit > 0 
                    ? `$${transaction.debit.toLocaleString()} (Dr)`
                    : `$${transaction.credit.toLocaleString()} (Cr)`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-secondary">{transaction.reference}</span>
                {transaction.bankFeed && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-secondary-100 text-secondary-700">
                    <Icon name="Building2" size={10} color="#0e7490" className="mr-1" />
                    Bank
                  </span>
                )}
              </div>
              <button 
                onClick={() => onTransactionClick(transaction)}
                className="text-sm text-secondary hover:text-secondary-700 nav-transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, transactions.length)} of {transactions.length} transactions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-primary-100 nav-transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-primary-100 nav-transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;