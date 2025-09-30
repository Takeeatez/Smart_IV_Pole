import React from 'react';
import Icon from 'components/AppIcon';

const ReconciliationSummary = ({ 
  progress, 
  totalTransactions, 
  matchedCount, 
  suggestedCount 
}) => {
  const unmatched = totalTransactions - matchedCount;
  const progressPercentage = Math.round(progress);

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Overview */}
        <div className="lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-text-primary">Reconciliation Progress</h4>
              <p className="text-sm text-text-secondary">Overall completion status</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Progress</span>
              <span className="text-sm font-medium text-text-primary">{progressPercentage}%</span>
            </div>
            
            <div className="w-full bg-background rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full nav-transition"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-success">{matchedCount} matched</span>
              <span className="text-text-secondary">{unmatched} remaining</span>
            </div>
          </div>
        </div>

        {/* Matched Transactions */}
        <div className="bg-success-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={16} color="var(--color-success)" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-success">{matchedCount}</p>
              <p className="text-xs text-success-700">Matched</p>
            </div>
          </div>
          <p className="text-xs text-success-700">Successfully reconciled transactions</p>
        </div>

        {/* Suggested Matches */}
        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Icon name="GitMerge" size={16} color="var(--color-secondary)" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-secondary">{suggestedCount}</p>
              <p className="text-xs text-secondary-700">Suggested</p>
            </div>
          </div>
          <p className="text-xs text-secondary-700">AI-powered match suggestions</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-heading font-semibold text-text-primary">{totalTransactions}</p>
            <p className="text-xs text-text-secondary">Total Transactions</p>
          </div>
          <div>
            <p className="text-lg font-heading font-semibold text-warning">{unmatched}</p>
            <p className="text-xs text-text-secondary">Unmatched</p>
          </div>
          <div>
            <p className="text-lg font-heading font-semibold text-accent">95%</p>
            <p className="text-xs text-text-secondary">Auto-Match Rate</p>
          </div>
          <div>
            <p className="text-lg font-heading font-semibold text-primary">2.5 min</p>
            <p className="text-xs text-text-secondary">Avg. Time Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationSummary;