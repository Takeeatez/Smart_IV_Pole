import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const TransactionDetails = ({ transaction, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    description: transaction.description,
    account: transaction.account,
    debit: transaction.debit,
    credit: transaction.credit,
    category: transaction.category,
    reference: transaction.reference
  });

  const handleSave = () => {
    console.log('Saving transaction:', editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      description: transaction.description,
      account: transaction.account,
      debit: transaction.debit,
      credit: transaction.credit,
      category: transaction.category,
      reference: transaction.reference
    });
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reconciled':
        return 'text-success bg-success-100';
      case 'pending':
        return 'text-warning bg-warning-100';
      case 'review':
        return 'text-error bg-error-100';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-text-primary">Transaction Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-primary-100 nav-transition"
          >
            <Icon name="X" size={16} color="#7f8c8d" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Transaction ID and Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Transaction ID</p>
            <p className="font-medium text-text-primary">{transaction.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>

        {/* Date */}
        <div>
          <p className="text-sm text-text-secondary mb-1">Date</p>
          <p className="text-text-primary">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-text-secondary mb-1">Description</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded focus:ring-2 focus:ring-border-focus focus:border-transparent"
            />
          ) : (
            <p className="text-text-primary">{transaction.description}</p>
          )}
        </div>

        {/* Account */}
        <div>
          <p className="text-sm text-text-secondary mb-1">Account</p>
          {isEditing ? (
            <select
              value={editData.account}
              onChange={(e) => setEditData({ ...editData, account: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded focus:ring-2 focus:ring-border-focus focus:border-transparent"
            >
              <option value="Office Expenses">Office Expenses</option>
              <option value="Accounts Receivable">Accounts Receivable</option>
              <option value="Bank Charges">Bank Charges</option>
              <option value="Fixed Assets">Fixed Assets</option>
              <option value="Utilities">Utilities</option>
            </select>
          ) : (
            <div>
              <p className="text-text-primary">{transaction.account}</p>
              <p className="text-sm text-text-secondary">{transaction.accountCode}</p>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-secondary mb-1">Debit</p>
            {isEditing ? (
              <input
                type="number"
                value={editData.debit}
                onChange={(e) => setEditData({ ...editData, debit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded focus:ring-2 focus:ring-border-focus focus:border-transparent"
              />
            ) : (
              <p className="text-text-primary font-medium">
                {transaction.debit > 0 ? `$${transaction.debit.toLocaleString()}` : '-'}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Credit</p>
            {isEditing ? (
              <input
                type="number"
                value={editData.credit}
                onChange={(e) => setEditData({ ...editData, credit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded focus:ring-2 focus:ring-border-focus focus:border-transparent"
              />
            ) : (
              <p className="text-text-primary font-medium">
                {transaction.credit > 0 ? `$${transaction.credit.toLocaleString()}` : '-'}
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-sm text-text-secondary mb-1">Category</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded focus:ring-2 focus:ring-border-focus focus:border-transparent"
            />
          ) : (
            <p className="text-text-primary">{transaction.category}</p>
          )}
        </div>

        {/* Reference */}
        <div>
          <p className="text-sm text-text-secondary mb-1">Reference</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.reference}
              onChange={(e) => setEditData({ ...editData, reference: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded focus:ring-2 focus:ring-border-focus focus:border-transparent"
            />
          ) : (
            <p className="text-text-primary">{transaction.reference}</p>
          )}
        </div>

        {/* Bank Feed Indicator */}
        {transaction.bankFeed && (
          <div className="flex items-center space-x-2 p-3 bg-secondary-50 rounded-lg">
            <Icon name="Building2" size={16} color="#0e7490" />
            <span className="text-sm text-secondary-700">Imported from bank feed</span>
          </div>
        )}

        {/* Attachments */}
        {transaction.attachments > 0 && (
          <div>
            <p className="text-sm text-text-secondary mb-2">Attachments ({transaction.attachments})</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-background rounded border border-border">
                <Icon name="FileText" size={16} color="#7f8c8d" />
                <span className="text-sm text-text-primary">receipt_001.pdf</span>
                <button className="ml-auto text-sm text-secondary hover:text-secondary-700 nav-transition">
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-border">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition flex items-center justify-center space-x-2"
              >
                <Icon name="Edit" size={16} color="white" />
                <span>Edit Transaction</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition flex items-center justify-center space-x-2">
                  <Icon name="Copy" size={16} color="#7f8c8d" />
                  <span>Duplicate</span>
                </button>
                <button className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition flex items-center justify-center space-x-2">
                  <Icon name="Trash2" size={16} color="#e74c3c" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;