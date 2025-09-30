import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const UserTable = ({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onSelectAll, 
  onUserClick, 
  selectedUser 
}) => {
  const formatLastActivity = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Partner': return 'bg-accent-100 text-accent-700';
      case 'Staff': return 'bg-primary-100 text-primary-700';
      case 'Freelancer': return 'bg-secondary-100 text-secondary-700';
      case 'Client': return 'bg-warning-100 text-warning-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ?'bg-success-100 text-success-700' :'bg-error-100 text-error-700';
  };

  const isOnline = (lastActivity) => {
    return Date.now() - lastActivity.getTime() < 900000; // 15 minutes
  };

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-text-primary">Team Members</h3>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <span>{users.length} users</span>
            <span>•</span>
            <span>{selectedUsers.length} selected</span>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr 
                key={user.id}
                className={`hover:bg-background nav-transition cursor-pointer ${
                  selectedUser?.id === user.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => onUserClick(user)}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUserSelect(user.id);
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {isOnline(user.lastActivity) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success border-2 border-surface rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{user.name}</p>
                      <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 2).map((permission, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                        {permission}
                      </span>
                    ))}
                    {user.permissions.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{user.permissions.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {formatLastActivity(user.lastActivity)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit user:', user.id);
                      }}
                      className="p-1 text-text-secondary hover:text-primary nav-transition"
                      title="Edit user"
                    >
                      <Icon name="Edit" size={16} color="currentColor" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('More actions for user:', user.id);
                      }}
                      className="p-1 text-text-secondary hover:text-primary nav-transition"
                      title="More actions"
                    >
                      <Icon name="MoreVertical" size={16} color="currentColor" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden divide-y divide-border">
        {users.map((user) => (
          <div 
            key={user.id}
            className={`p-4 hover:bg-background nav-transition cursor-pointer ${
              selectedUser?.id === user.id ? 'bg-primary-50' : ''
            }`}
            onClick={() => onUserClick(user)}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  onUserSelect(user.id);
                }}
                className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
              
              <div className="relative">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {isOnline(user.lastActivity) && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success border-2 border-surface rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
                
                <p className="text-sm text-text-secondary mb-2">{user.email}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatLastActivity(user.lastActivity)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {user.permissions.slice(0, 3).map((permission, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                      {permission}
                    </span>
                  ))}
                  {user.permissions.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{user.permissions.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Edit user:', user.id);
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-primary hover:bg-primary-100 rounded nav-transition"
                  >
                    <Icon name="Edit" size={12} color="var(--color-primary)" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('More actions for user:', user.id);
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-text-secondary hover:bg-background rounded nav-transition"
                  >
                    <Icon name="MoreVertical" size={12} color="currentColor" />
                    <span>More</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="Users" size={32} color="var(--color-primary)" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No users found</h3>
          <p className="text-text-secondary">Get started by adding your first team member.</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;