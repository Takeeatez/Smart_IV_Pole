import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ collapsed, onToggle, userRole = 'staff' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');

  const navigationItems = [
    {
      section: 'patient-care',
      label: 'Patient Care',
      items: [
        {
          label: 'Ward Overview',
          path: '/ward-overview-dashboard',
          icon: 'LayoutDashboard',
          roles: ['nurse', 'doctor', 'staff', 'admin'],
          tooltip: 'Real-time ward status and patient monitoring'
        },
        {
          label: 'Patient Management',
          path: '/patient-management',
          icon: 'Users',
          roles: ['nurse', 'doctor', 'staff', 'admin'],
          tooltip: 'Comprehensive patient records and care management'
        }
      ]
    },
    {
      section: 'medical-records',
      label: 'Medical Records',
      items: [
        {
          label: 'Medical History',
          path: '/medical-history',
          icon: 'FileText',
          roles: ['nurse', 'doctor', 'staff'],
          tooltip: 'Patient medical history and records'
        },
        {
          label: 'Lab Results',
          path: '/lab-results',
          icon: 'TestTube',
          roles: ['nurse', 'doctor', 'staff'],
          tooltip: 'Laboratory test results and reports'
        }
      ]
    },
    {
      section: 'operations',
      label: 'Hospital Operations',
      items: [
        {
          label: 'Staff Schedule',
          path: '/staff-schedule',
          icon: 'Calendar',
          roles: ['nurse', 'admin'],
          tooltip: 'Nursing staff schedules and assignments'
        },
        {
          label: 'Medication Management',
          path: '/medication-management',
          icon: 'Pill',
          roles: ['nurse', 'doctor'],
          tooltip: 'Medication administration and tracking'
        }
      ]
    },
    {
      section: 'administration',
      label: 'Administration',
      items: [
        {
          label: 'User Management',
          path: '/user-management',
          icon: 'UserCog',
          roles: ['admin'],
          tooltip: 'Manage hospital staff and users'
        },
        {
          label: 'System Settings',
          path: '/system-settings',
          icon: 'Settings',
          roles: ['admin'],
          tooltip: 'Hospital management system settings'
        }
      ]
    },
    {
      section: 'legacy',
      label: 'Legacy System',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: 'LayoutDashboard',
          roles: ['partner', 'staff', 'freelancer', 'client'],
          tooltip: 'Financial overview and insights'
        },
        {
          label: 'Transaction Management',
          path: '/transactions-management',
          icon: 'Receipt',
          roles: ['partner', 'staff', 'freelancer'],
          tooltip: 'Manage financial transactions'
        },
        {
          label: 'Bank Reconciliation',
          path: '/bank-reconciliation',
          icon: 'Building2',
          roles: ['partner', 'staff', 'freelancer'],
          tooltip: 'Reconcile bank statements'
        },
        {
          label: 'Financial Reports',
          path: '/financial-reports',
          icon: 'FileText',
          roles: ['partner', 'staff', 'freelancer'],
          tooltip: 'Generate financial statements'
        },
        {
          label: 'Tax Compliance Center',
          path: '/tax-compliance-center',
          icon: 'Calculator',
          roles: ['partner', 'staff'],
          tooltip: 'Tax filing and compliance'
        },
        {
          label: 'Client Portal',
          path: '/client-portal',
          icon: 'Globe',
          roles: ['partner', 'staff', 'client'],
          tooltip: 'Client access and communication'
        }
      ]
    }
  ];

  // Filter navigation items based on user role - ensure stable filtering
  const filteredNavigation = React.useMemo(() => {
    return navigationItems.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Ensure userRole is always a string and handle edge cases
        const normalizedUserRole = typeof userRole === 'string' ? userRole.toLowerCase() : 'staff';
        const itemRoles = item.roles.map(role => role.toLowerCase());
        return itemRoles.includes(normalizedUserRole);
      })
    })).filter(section => section.items.length > 0);
  }, [userRole]);

  // Set active section based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    for (const section of navigationItems) {
      for (const item of section.items) {
        if (item.path === currentPath) {
          setActiveSection(section.section);
          return; // Exit early when match is found
        }
      }
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isItemActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-sidebar"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-header-height left-0 h-[calc(100vh-64px)] bg-primary border-r border-border z-sidebar
        nav-transition lg:translate-x-0
        ${collapsed ? '-translate-x-full lg:w-sidebar-collapsed' : 'translate-x-0 w-sidebar-width'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-primary-700">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <h2 className="font-heading font-semibold text-white">Navigation</h2>
              )}
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-primary-700 nav-transition"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Icon 
                  name={collapsed ? 'ChevronRight' : 'ChevronLeft'} 
                  size={16} 
                  color="white" 
                />
              </button>
            </div>
          </div>

          {/* Navigation Content */}
          <nav className="flex-1 overflow-y-auto py-4">
            {filteredNavigation.map((section) => (
              <div key={section.section} className="mb-6">
                {!collapsed && (
                  <h3 className="px-4 mb-2 text-xs font-caption font-medium text-primary-200 uppercase tracking-wider">
                    {section.label}
                  </h3>
                )}
                
                <ul className="space-y-1 px-2">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={`
                          w-full flex items-center px-3 py-3 rounded-lg nav-transition
                          ${isItemActive(item.path)
                            ? 'bg-white text-primary shadow-card' :'text-primary-100 hover:bg-primary-700 hover:text-white'
                          }
                          ${collapsed ? 'justify-center' : 'justify-start space-x-3'}
                        `}
                        title={collapsed ? item.tooltip : ''}
                        aria-label={item.label}
                      >
                        <Icon 
                          name={item.icon} 
                          size={20} 
                          color={isItemActive(item.path) ? '#283593' : '#E8EAF6'} 
                        />
                        {!collapsed && (
                          <span className="font-nav text-nav font-medium">{item.label}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-primary-700">
            {!collapsed ? (
              <div className="bg-primary-800 rounded-lg p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <Icon name="Zap" size={16} color="white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Quick Actions</p>
                    <p className="text-xs text-primary-200">Keyboard shortcuts</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-primary-200">
                  <div className="flex justify-between">
                    <span>New Admission</span>
                    <kbd className="px-1 py-0.5 bg-primary-700 rounded text-white font-data">Ctrl+N</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Alert</span>
                    <kbd className="px-1 py-0.5 bg-red-600 rounded text-white font-data">F1</kbd>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="w-full p-2 rounded-lg hover:bg-primary-700 nav-transition flex justify-center"
                title="Quick Actions"
                aria-label="Quick Actions"
              >
                <Icon name="Zap" size={20} color="#FF9800" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;