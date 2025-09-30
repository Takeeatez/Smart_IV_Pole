import React from 'react';
import Icon from 'components/AppIcon';

const BulkActionsBar = ({ 
  selectedBankCount, 
  selectedRecordedCount, 
  onBulkAccept, 
  onManualMatch, 
  canManualMatch 
}) => {
  const hasSelections = selectedBankCount > 0 || selectedRecordedCount > 0;

  if (!hasSelections) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Zap" size={20} color="var(--color-accent)" />
            <div>
              <h4 className="font-heading font-medium text-text-primary">Quick Actions</h4>
              <p className="text-sm text-text-secondary">Select transactions to enable bulk operations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onBulkAccept}
              className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success-700 nav-transition"
            >
              <Icon name="CheckCircle" size={16} color="white" />
              <span>Accept High-Confidence Matches</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition">
              <Icon name="Settings" size={16} color="var(--color-text-primary)" />
              <span>Matching Rules</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Selection Summary */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="MousePointer" size={20} color="var(--color-primary)" />
            <span className="font-medium text-primary">Selections:</span>
          </div>
          
          {selectedBankCount > 0 && (
            <div className="flex items-center space-x-2 bg-surface px-3 py-1 rounded-full">
              <Icon name="Building2" size={14} color="var(--color-primary)" />
              <span className="text-sm text-primary font-medium">{selectedBankCount} Bank</span>
            </div>
          )}
          
          {selectedRecordedCount > 0 && (
            <div className="flex items-center space-x-2 bg-surface px-3 py-1 rounded-full">
              <Icon name="FileText" size={14} color="var(--color-accent)" />
              <span className="text-sm text-accent font-medium">{selectedRecordedCount} Recorded</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {canManualMatch && (
            <button
              onClick={onManualMatch}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 nav-transition"
            >
              <Icon name="Link" size={16} color="white" />
              <span>Create Manual Match</span>
            </button>
          )}
          
          <button
            onClick={onBulkAccept}
            className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success-700 nav-transition"
          >
            <Icon name="CheckCircle" size={16} color="white" />
            <span>Accept All High-Confidence</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition">
            <Icon name="X" size={16} color="var(--color-text-primary)" />
            <span>Clear Selection</span>
          </button>
        </div>
      </div>

      {/* Matching Hint */}
      {canManualMatch && (
        <div className="mt-3 pt-3 border-t border-primary-200">
          <div className="flex items-center space-x-2 text-sm text-primary">
            <Icon name="Info" size={14} color="var(--color-primary)" />
            <span>You can create a manual match between the selected bank and recorded transaction</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionsBar;