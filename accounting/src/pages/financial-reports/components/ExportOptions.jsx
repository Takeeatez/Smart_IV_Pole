import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ExportOptions = ({ reportName, onExport }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const exportOptions = [
    {
      format: 'pdf',
      label: 'Export as PDF',
      icon: 'FileText',
      description: 'Professional formatted report'
    },
    {
      format: 'excel',
      label: 'Export to Excel',
      icon: 'FileSpreadsheet',
      description: 'Editable spreadsheet format'
    },
    {
      format: 'csv',
      label: 'Export as CSV',
      icon: 'Database',
      description: 'Raw data for analysis'
    },
    {
      format: 'print',
      label: 'Print Report',
      icon: 'Printer',
      description: 'Print-optimized layout'
    }
  ];

  const handleExport = (format) => {
    onExport(format);
    setShowDropdown(false);
  };

  const handlePrint = () => {
    window.print();
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition"
      >
        <Icon name="Download" size={18} color="white" />
        <span className="font-medium">Export</span>
        <Icon name="ChevronDown" size={16} color="white" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-lg shadow-floating border border-border z-20">
            <div className="p-3 border-b border-border">
              <h3 className="font-medium text-text-primary">Export Options</h3>
              <p className="text-sm text-text-secondary">{reportName}</p>
            </div>
            
            <div className="py-2">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => option.format === 'print' ? handlePrint() : handleExport(option.format)}
                  className="w-full px-4 py-3 text-left hover:bg-background nav-transition flex items-start space-x-3"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={option.icon} size={16} color="var(--color-primary)" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{option.label}</p>
                    <p className="text-xs text-text-secondary">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="border-t border-border p-3">
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <Icon name="Info" size={12} color="var(--color-text-secondary)" />
                <span>Exports include current filter settings</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportOptions;