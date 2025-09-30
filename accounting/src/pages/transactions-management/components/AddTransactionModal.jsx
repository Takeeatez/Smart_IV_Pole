import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AddTransactionModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    account: '',
    debitAccount: '',
    creditAccount: '',
    amount: '',
    reference: '',
    category: '',
    type: 'expense',
    attachments: []
  });

  const [errors, setErrors] = useState({});

  const accounts = [
    { code: '1000', name: 'Cash', type: 'asset' },
    { code: '1200', name: 'Accounts Receivable', type: 'asset' },
    { code: '1500', name: 'Fixed Assets', type: 'asset' },
    { code: '2000', name: 'Accounts Payable', type: 'liability' },
    { code: '3000', name: 'Owner Equity', type: 'equity' },
    { code: '4000', name: 'Revenue', type: 'income' },
    { code: '6200', name: 'Office Expenses', type: 'expense' },
    { code: '6300', name: 'Bank Charges', type: 'expense' },
    { code: '6400', name: 'Utilities', type: 'expense' }
  ];

  const categories = [
    'Operating Expenses',
    'Financial Expenses',
    'Capital Expenditure',
    'Revenue',
    'Cost of Goods Sold',
    'Administrative Expenses'
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.debitAccount) {
      newErrors.debitAccount = 'Debit account is required';
    }
    if (!formData.creditAccount) {
      newErrors.creditAccount = 'Credit account is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (formData.debitAccount === formData.creditAccount) {
      newErrors.creditAccount = 'Credit account must be different from debit account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        id: `TXN-${Date.now()}`,
        status: 'pending'
      };
      onSubmit(transactionData);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
  };

  const removeAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <div className="bg-surface rounded-lg shadow-floating w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-text-primary">
              Add New Transaction
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary-100 nav-transition"
            >
              <Icon name="X" size={20} color="#7f8c8d" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Transaction Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter transaction description"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                errors.description ? 'border-error' : 'border-border'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description}</p>
            )}
          </div>

          {/* Double Entry Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Debit Account *
              </label>
              <select
                value={formData.debitAccount}
                onChange={(e) => handleInputChange('debitAccount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                  errors.debitAccount ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select debit account</option>
                {accounts.map((account) => (
                  <option key={account.code} value={account.name}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
              {errors.debitAccount && (
                <p className="mt-1 text-sm text-error">{errors.debitAccount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Credit Account *
              </label>
              <select
                value={formData.creditAccount}
                onChange={(e) => handleInputChange('creditAccount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                  errors.creditAccount ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select credit account</option>
                {accounts.map((account) => (
                  <option key={account.code} value={account.name}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
              {errors.creditAccount && (
                <p className="mt-1 text-sm text-error">{errors.creditAccount}</p>
              )}
            </div>
          </div>

          {/* Amount and Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                    errors.amount ? 'border-error' : 'border-border'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-error">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Reference
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Invoice number, check number, etc."
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Icon name="Upload" size={24} color="#7f8c8d" />
                <span className="text-sm text-text-secondary">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-text-secondary">
                  PDF, JPG, PNG, DOC up to 10MB each
                </span>
              </label>
            </div>

            {/* Attachment List */}
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                    <div className="flex items-center space-x-2">
                      <Icon name="FileText" size={16} color="#7f8c8d" />
                      <span className="text-sm text-text-primary">{file.name}</span>
                      <span className="text-xs text-text-secondary">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 rounded hover:bg-error-100 nav-transition"
                    >
                      <Icon name="X" size={14} color="#e74c3c" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition flex items-center justify-center space-x-2"
            >
              <Icon name="Plus" size={16} color="white" />
              <span>Add Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;