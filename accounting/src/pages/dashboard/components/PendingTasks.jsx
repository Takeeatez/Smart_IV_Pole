import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const PendingTasks = ({ userRole }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Review Q4 2023 Financial Statements',
      description: 'Final review required before client presentation',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      assignee: 'Sarah Johnson',
      category: 'review',
      completed: false
    },
    {
      id: 2,
      title: 'Reconcile December Credit Card Statements',
      description: 'Chase Business Card - 45 transactions pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 172800000), // 2 days
      assignee: 'Mike Chen',
      category: 'reconciliation',
      completed: false
    },
    {
      id: 3,
      title: 'Prepare Tax Documents for TechStart LLC',
      description: 'Gather supporting documents for tax filing',
      priority: 'high',
      dueDate: new Date(Date.now() + 259200000), // 3 days
      assignee: 'Lisa Wong',
      category: 'tax',
      completed: false
    },
    {
      id: 4,
      title: 'Follow up on Outstanding Invoice #INV-2023-156',
      description: 'Payment overdue by 15 days - $2,850.00',
      priority: 'urgent',
      dueDate: new Date(Date.now() - 86400000), // Yesterday (overdue)
      assignee: 'Sarah Johnson',
      category: 'collections',
      completed: false
    },
    {
      id: 5,
      title: 'Update Chart of Accounts',
      description: 'Add new expense categories for 2024',
      priority: 'low',
      dueDate: new Date(Date.now() + 604800000), // 1 week
      assignee: 'Mike Chen',
      category: 'setup',
      completed: false
    }
  ]);

  const handleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return { bg: 'bg-error-100', text: 'text-error', border: 'border-error' };
      case 'high':
        return { bg: 'bg-warning-100', text: 'text-warning', border: 'border-warning' };
      case 'medium':
        return { bg: 'bg-secondary-100', text: 'text-secondary', border: 'border-secondary' };
      case 'low':
        return { bg: 'bg-success-100', text: 'text-success', border: 'border-success' };
      default:
        return { bg: 'bg-primary-100', text: 'text-primary', border: 'border-primary' };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'review':
        return 'Eye';
      case 'reconciliation':
        return 'Building2';
      case 'tax':
        return 'Calculator';
      case 'collections':
        return 'DollarSign';
      case 'setup':
        return 'Settings';
      default:
        return 'CheckSquare';
    }
  };

  const formatDueDate = (dueDate) => {
    const now = new Date();
    const diff = dueDate - now;
    const days = Math.ceil(diff / 86400000);
    
    if (days < 0) {
      return { text: `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`, color: 'text-error' };
    } else if (days === 0) {
      return { text: 'Due today', color: 'text-warning' };
    } else if (days === 1) {
      return { text: 'Due tomorrow', color: 'text-warning' };
    } else {
      return { text: `Due in ${days} days`, color: 'text-text-secondary' };
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">Pending Tasks</h3>
            <p className="text-sm text-text-secondary">
              {activeTasks.length} pending, {completedTasks.length} completed
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-background nav-transition">
              <Icon name="Plus" size={16} color="#7f8c8d" />
            </button>
            <button className="p-2 rounded-lg hover:bg-background nav-transition">
              <Icon name="MoreHorizontal" size={16} color="#7f8c8d" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activeTasks.map((task) => {
            const priorityColors = getPriorityColor(task.priority);
            const dueDateInfo = formatDueDate(task.dueDate);
            
            return (
              <div key={task.id} className="p-4 rounded-lg border border-border hover:bg-background nav-transition">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleTaskComplete(task.id)}
                    className="mt-1 p-1 rounded hover:bg-primary-100 nav-transition"
                  >
                    <Icon 
                      name={task.completed ? 'CheckSquare' : 'Square'} 
                      size={16} 
                      color={task.completed ? '#27ae60' : '#7f8c8d'} 
                    />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-text-primary">{task.title}</h4>
                        <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                        
                        <div className="flex items-center space-x-3 mt-3">
                          <div className="flex items-center space-x-1">
                            <Icon name={getCategoryIcon(task.category)} size={12} color="#7f8c8d" />
                            <span className="text-xs text-text-secondary capitalize">{task.category}</span>
                          </div>
                          
                          <span className={`text-xs ${dueDateInfo.color}`}>
                            {dueDateInfo.text}
                          </span>
                          
                          <span className="text-xs text-text-secondary">
                            {task.assignee}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-3">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full capitalize
                          ${priorityColors.bg} ${priorityColors.text}
                        `}>
                          {task.priority}
                        </span>
                        
                        <button className="p-1 rounded hover:bg-primary-100 nav-transition">
                          <Icon name="MoreVertical" size={14} color="#7f8c8d" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeTasks.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={24} color="#27ae60" />
            </div>
            <p className="text-text-primary font-medium">All caught up!</p>
            <p className="text-text-secondary text-sm">No pending tasks at the moment</p>
          </div>
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <button className="w-full text-left text-sm text-text-secondary hover:text-text-primary nav-transition">
              <div className="flex items-center justify-between">
                <span>Completed Tasks ({completedTasks.length})</span>
                <Icon name="ChevronDown" size={16} color="#7f8c8d" />
              </div>
            </button>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-6 pt-4 border-t border-border">
          <button className="w-full text-center text-sm text-secondary hover:text-secondary-700 nav-transition font-medium">
            View all tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTasks;