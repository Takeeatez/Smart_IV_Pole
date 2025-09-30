import React from 'react';
import Icon from 'components/AppIcon';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ReportViewer = ({ report, data, loading, filters }) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-text-secondary">Generating report...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-surface rounded-lg border border-border p-12 text-center">
        <Icon name="AlertCircle" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
          No Data Available
        </h3>
        <p className="text-text-secondary">
          Unable to generate report data for the selected parameters
        </p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const renderProfitLossReport = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success-700 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-success-800">
                {formatCurrency(data.sections[0].total)}
              </p>
            </div>
            <Icon name="TrendingUp" size={24} color="var(--color-success)" />
          </div>
        </div>
        
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-error-700 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-error-800">
                {formatCurrency(Math.abs(data.sections[1].total + data.sections[2].total))}
              </p>
            </div>
            <Icon name="TrendingDown" size={24} color="var(--color-error)" />
          </div>
        </div>
        
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium">Net Income</p>
              <p className="text-2xl font-bold text-primary-800">
                {formatCurrency(data.netIncome)}
              </p>
            </div>
            <Icon name="DollarSign" size={24} color="var(--color-primary)" />
          </div>
        </div>
        
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-700 font-medium">Profit Margin</p>
              <p className="text-2xl font-bold text-accent-800">
                {((data.netIncome / data.sections[0].total) * 100).toFixed(1)}%
              </p>
            </div>
            <Icon name="Percent" size={24} color="var(--color-accent)" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Financial Overview
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                {data.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-6">
        {data.sections.map((section, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
              {section.name}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-sm font-medium text-text-secondary">Account</th>
                    <th className="text-right py-2 text-sm font-medium text-text-secondary">Amount</th>
                    <th className="text-right py-2 text-sm font-medium text-text-secondary">% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className="border-b border-border last:border-b-0">
                      <td className="py-3 text-sm text-text-primary">{item.account}</td>
                      <td className={`py-3 text-sm text-right font-medium ${
                        item.amount >= 0 ? 'text-success' : 'text-error'
                      }`}>
                        {item.amount >= 0 ? '' : '-'}{formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 text-sm text-right text-text-secondary">
                        {Math.abs(item.percentage).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-primary bg-primary-50">
                    <td className="py-3 text-sm font-semibold text-text-primary">
                      Total {section.name}
                    </td>
                    <td className={`py-3 text-sm text-right font-bold ${
                      section.total >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {section.total >= 0 ? '' : '-'}{formatCurrency(section.total)}
                    </td>
                    <td className="py-3 text-sm text-right font-medium text-text-primary">
                      {((Math.abs(section.total) / data.sections[0].total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBalanceSheetReport = () => (
    <div className="space-y-6">
      {data.sections.map((section, index) => (
        <div key={index} className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            {section.name}
          </h3>
          
          {section.subsections ? (
            <div className="space-y-4">
              {section.subsections.map((subsection, subIndex) => (
                <div key={subIndex}>
                  <h4 className="font-medium text-text-primary mb-2">{subsection.name}</h4>
                  <div className="overflow-x-auto ml-4">
                    <table className="w-full">
                      <tbody>
                        {subsection.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="border-b border-border last:border-b-0">
                            <td className="py-2 text-sm text-text-primary">{item.account}</td>
                            <td className="py-2 text-sm text-right font-medium text-text-primary">
                              {item.amount >= 0 ? '' : '('}{formatCurrency(item.amount)}{item.amount < 0 ? ')' : ''}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-primary bg-primary-50">
                          <td className="py-2 text-sm font-semibold text-text-primary">
                            Total {subsection.name}
                          </td>
                          <td className="py-2 text-sm text-right font-bold text-text-primary">
                            {formatCurrency(subsection.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {section.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className="border-b border-border last:border-b-0">
                      <td className="py-2 text-sm text-text-primary">{item.account}</td>
                      <td className="py-2 text-sm text-right font-medium text-text-primary">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="border-t-2 border-primary bg-primary-50 -mx-6 px-6 py-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-text-primary">Total {section.name}</span>
              <span className="font-bold text-text-primary text-lg">
                {formatCurrency(section.total)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCashFlowReport = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-700 font-medium">Beginning Cash</p>
          <p className="text-xl font-bold text-primary-800">
            {formatCurrency(data.beginningCash)}
          </p>
        </div>
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
          <p className="text-sm text-secondary-700 font-medium">Net Cash Flow</p>
          <p className="text-xl font-bold text-secondary-800">
            {formatCurrency(data.netCashFlow)}
          </p>
        </div>
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <p className="text-sm text-success-700 font-medium">Ending Cash</p>
          <p className="text-xl font-bold text-success-800">
            {formatCurrency(data.endingCash)}
          </p>
        </div>
      </div>

      {/* Cash Flow Sections */}
      {data.sections.map((section, index) => (
        <div key={index} className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            {section.name}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {section.items.map((item, itemIndex) => (
                  <tr key={itemIndex} className="border-b border-border last:border-b-0">
                    <td className="py-2 text-sm text-text-primary">{item.account}</td>
                    <td className={`py-2 text-sm text-right font-medium ${
                      item.amount >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {item.amount >= 0 ? '' : '('}{formatCurrency(item.amount)}{item.amount < 0 ? ')' : ''}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-primary bg-primary-50">
                  <td className="py-3 text-sm font-semibold text-text-primary">
                    Net Cash from {section.name}
                  </td>
                  <td className={`py-3 text-sm text-right font-bold ${
                    section.total >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {section.total >= 0 ? '' : '('}{formatCurrency(section.total)}{section.total < 0 ? ')' : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  const renderReportContent = () => {
    switch (report.id) {
      case 'profit-loss':
        return renderProfitLossReport();
      case 'balance-sheet':
        return renderBalanceSheetReport();
      case 'cash-flow':
        return renderCashFlowReport();
      default:
        return (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
            <p className="text-text-secondary">Report viewer for {report.name} is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Report Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">{data.title}</h2>
            <p className="text-text-secondary mt-1">{data.period}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Format:</span>
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium">
              {filters.format === 'summary' ? 'Summary' : 'Detailed'}
            </span>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-6">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportViewer;