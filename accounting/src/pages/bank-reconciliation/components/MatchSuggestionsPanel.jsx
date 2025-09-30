import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const MatchSuggestionsPanel = ({ 
  suggestions, 
  onMatchAccept, 
  onMatchReject 
}) => {
  const [sortBy, setSortBy] = useState('confidence');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedSuggestions = [...suggestions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'date') {
      aValue = new Date(a.bankTransaction.date);
      bValue = new Date(b.bankTransaction.date);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return amount >= 0 ? `+$${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                       : `-$${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-success';
    if (confidence >= 0.7) return 'text-warning';
    return 'text-error';
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) return 'bg-success-100 text-success-700 border-success-200';
    if (confidence >= 0.7) return 'bg-warning-100 text-warning-700 border-warning-200';
    return 'bg-error-100 text-error-700 border-error-200';
  };

  return (
    <div className="bg-surface rounded-lg border border-border h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-text-primary flex items-center space-x-2">
            <Icon name="GitMerge" size={20} color="var(--color-secondary)" />
            <span>Match Suggestions</span>
          </h3>
          <span className="text-sm text-text-secondary bg-secondary-100 px-2 py-1 rounded-full">
            {suggestions.length} suggested
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleSort('confidence')}
            className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-background nav-transition flex items-center space-x-1"
          >
            <span>Confidence</span>
            <Icon 
              name={sortBy === 'confidence' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
              size={14} 
              color="#7f8c8d" 
            />
          </button>
          
          <button
            onClick={() => handleSort('date')}
            className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-background nav-transition flex items-center space-x-1"
          >
            <span>Date</span>
            <Icon 
              name={sortBy === 'date' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
              size={14} 
              color="#7f8c8d" 
            />
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="overflow-y-auto max-h-96">
        {sortedSuggestions.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Search" size={48} color="#7f8c8d" className="mx-auto mb-4" />
            <p className="text-text-secondary">No match suggestions available</p>
            <p className="text-sm text-text-secondary mt-2">
              Try adjusting your matching rules or import more transactions
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-3">
            {sortedSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 rounded-lg border border-border hover:border-secondary-200 hover:bg-background nav-transition"
              >
                {/* Confidence Score */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getConfidenceBadge(suggestion.confidence)}`}>
                    {Math.round(suggestion.confidence * 100)}% Match
                  </span>
                  <span className="text-xs text-text-secondary">
                    {suggestion.matchReason}
                  </span>
                </div>

                {/* Bank Transaction */}
                <div className="bg-primary-50 rounded-lg p-3 mb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Building2" size={14} color="var(--color-primary)" />
                    <span className="text-xs font-medium text-primary">Bank Transaction</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(suggestion.bankTransaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary mb-1">
                    {suggestion.bankTransaction.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Ref: {suggestion.bankTransaction.reference}
                    </span>
                    <span className={`text-sm font-medium ${
                      suggestion.bankTransaction.amount >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {formatAmount(suggestion.bankTransaction.amount)}
                    </span>
                  </div>
                </div>

                {/* Match Arrow */}
                <div className="flex justify-center my-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-px bg-border"></div>
                    <Icon name="ArrowDown" size={16} color="var(--color-secondary)" />
                    <div className="w-4 h-px bg-border"></div>
                  </div>
                </div>

                {/* Recorded Transaction */}
                <div className="bg-secondary-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="FileText" size={14} color="var(--color-secondary)" />
                    <span className="text-xs font-medium text-secondary">Recorded Transaction</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(suggestion.recordedTransaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary mb-1">
                    {suggestion.recordedTransaction.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {suggestion.recordedTransaction.account} • {suggestion.recordedTransaction.reference}
                    </span>
                    <span className={`text-sm font-medium ${
                      suggestion.recordedTransaction.amount >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {formatAmount(suggestion.recordedTransaction.amount)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onMatchAccept(suggestion.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-success text-white rounded-lg hover:bg-success-700 nav-transition text-sm"
                  >
                    <Icon name="Check" size={14} color="white" />
                    <span>Accept Match</span>
                  </button>
                  
                  <button
                    onClick={() => onMatchReject(suggestion.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background nav-transition text-sm"
                  >
                    <Icon name="X" size={14} color="var(--color-text-primary)" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchSuggestionsPanel;