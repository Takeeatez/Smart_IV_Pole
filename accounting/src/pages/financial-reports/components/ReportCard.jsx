import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ReportCard = ({ report, isSelected, onClick }) => {
  const getFrequencyColor = (frequency) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 'bg-success-100 text-success-700';
      case 'weekly':
        return 'bg-secondary-100 text-secondary-700';
      case 'monthly':
        return 'bg-accent-100 text-accent-700';
      case 'quarterly':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border nav-transition
        ${isSelected 
          ? 'border-primary bg-primary-50 shadow-card' 
          : 'border-border hover:border-primary-200 hover:bg-primary-50'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={report.thumbnail}
            alt={report.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`
            font-medium text-sm mb-1 truncate
            ${isSelected ? 'text-primary' : 'text-text-primary'}
          `}>
            {report.name}
          </h4>
          
          <p className="text-xs text-text-secondary mb-2 line-clamp-2">
            {report.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${getFrequencyColor(report.frequency)}
            `}>
              {report.frequency}
            </span>
            
            {isSelected && (
              <Icon name="Check" size={14} color="var(--color-primary)" />
            )}
          </div>
          
          <div className="flex items-center space-x-1 mt-2">
            <Icon name="Clock" size={12} color="var(--color-text-secondary)" />
            <span className="text-xs text-text-secondary">
              Updated {new Date(report.lastGenerated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ReportCard;