import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AddUserModal = ({ onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    department: '',
    permissions: [],
    status: 'Active',
    sendInvite: true
  });

  const [errors, setErrors] = useState({});

  const availablePermissions = [
    'Full Access',
    'User Management',
    'Transaction Management',
    'Financial Reports',
    'Bank Reconciliation',
    'Tax Compliance',
    'Client Portal',
    'View Reports',
    'Export Data',
    'Audit Logs'
  ];

  const rolePermissions = {
    'Partner': ['Full Access', 'User Management', 'Transaction Management', 'Financial Reports', 'Bank Reconciliation', 'Tax Compliance', 'Client Portal', 'View Reports', 'Export Data', 'Audit Logs'],
    'Staff': ['Transaction Management', 'Financial Reports', 'Bank Reconciliation', 'Tax Compliance', 'View Reports', 'Export Data'],
    'Freelancer': ['Transaction Management', 'Financial Reports', 'View Reports', 'Export Data'],
    'Client': ['Client Portal', 'View Reports']
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role] || []
    }));
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddUser(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <div className="bg-surface rounded-lg shadow-floating max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-text-primary">Add New User</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg nav-transition"
          >
            <Icon name="X" size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                      errors.name ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                      errors.email ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                      errors.phone ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent ${
                      errors.department ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Enter department"
                  />
                  {errors.department && <p className="mt-1 text-sm text-error">{errors.department}</p>}
                </div>
              </div>
            </div>

            {/* Role and Status */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Role & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
                  >
                    <option value="Partner">Partner</option>
                    <option value="Staff">Staff</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Client">Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <label key={permission} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-background nav-transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-text-primary">{permission}</span>
                  </label>
                ))}
              </div>
              {errors.permissions && <p className="mt-2 text-sm text-error">{errors.permissions}</p>}
            </div>

            {/* Additional Options */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Additional Options</h3>
              <label className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-background nav-transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendInvite}
                  onChange={(e) => handleInputChange('sendInvite', e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">Send invitation email</span>
                  <p className="text-xs text-text-secondary">User will receive an email with login instructions</p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-surface nav-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition flex items-center space-x-2"
            >
              <Icon name="UserPlus" size={16} color="white" />
              <span>Add User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;