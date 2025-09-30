import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const TaxCalculationModule = () => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('IN');
  const [calculationType, setCalculationType] = useState('gst');

  // Mock tax rates data
  const taxRates = {
    IN: {
      gst: [
        { category: 'Essential Goods', rate: 0, description: 'Basic food items, medicines' },
        { category: 'Reduced Rate', rate: 5, description: 'Household necessities' },
        { category: 'Standard Rate', rate: 12, description: 'Processed foods, textiles' },
        { category: 'Higher Rate', rate: 18, description: 'Most goods and services' },
        { category: 'Luxury Rate', rate: 28, description: 'Luxury items, automobiles' }
      ]
    },
    US: {
      sales_tax: [
        { category: 'No Tax', rate: 0, description: 'Exempt items' },
        { category: 'Standard Rate', rate: 6.5, description: 'General goods' },
        { category: 'Local Rate', rate: 8.25, description: 'With local additions' }
      ]
    }
  };

  const jurisdictions = [
    { code: 'IN', name: 'India (GST)', flag: '🇮🇳' },
    { code: 'US', name: 'United States (Sales Tax)', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom (VAT)', flag: '🇬🇧' },
    { code: 'EU', name: 'European Union (VAT)', flag: '🇪🇺' }
  ];

  const calculationTypes = [
    { id: 'gst', label: 'GST Calculation', icon: 'Calculator' },
    { id: 'eway', label: 'E-way Bill', icon: 'Truck' },
    { id: 'bulk', label: 'Bulk Processing', icon: 'Database' }
  ];

  const [transactionData, setTransactionData] = useState({
    amount: '',
    taxRate: '',
    description: '',
    hsn: '',
    place: ''
  });

  const handleCalculation = () => {
    const amount = parseFloat(transactionData.amount);
    const rate = parseFloat(transactionData.taxRate);
    
    if (amount && rate) {
      const taxAmount = (amount * rate) / 100;
      const totalAmount = amount + taxAmount;
      
      console.log('Tax Calculation:', {
        baseAmount: amount,
        taxRate: rate,
        taxAmount: taxAmount,
        totalAmount: totalAmount
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Jurisdiction and Type Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Select Jurisdiction
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {jurisdictions.map((jurisdiction) => (
              <button
                key={jurisdiction.code}
                onClick={() => setSelectedJurisdiction(jurisdiction.code)}
                className={`
                  p-4 rounded-lg border nav-transition text-left
                  ${selectedJurisdiction === jurisdiction.code
                    ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-200 text-text-primary'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{jurisdiction.flag}</span>
                  <div>
                    <p className="font-medium">{jurisdiction.name}</p>
                    <p className="text-xs opacity-70">Tax System</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Calculation Type
          </label>
          <div className="space-y-2">
            {calculationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setCalculationType(type.id)}
                className={`
                  w-full p-3 rounded-lg border nav-transition text-left flex items-center space-x-3
                  ${calculationType === type.id
                    ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-200 text-text-primary'
                  }
                `}
              >
                <Icon 
                  name={type.icon} 
                  size={20} 
                  color={calculationType === type.id ? 'var(--color-primary)' : 'var(--color-text-primary)'} 
                />
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Rates Table */}
      <div className="bg-background rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Current Tax Rates - {jurisdictions.find(j => j.code === selectedJurisdiction)?.name}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Rate (%)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {taxRates[selectedJurisdiction]?.[calculationType === 'gst' ? 'gst' : 'gst']?.map((rate, index) => (
                <tr key={index} className="border-b border-border hover:bg-primary-50 nav-transition">
                  <td className="py-3 px-4 text-sm text-text-primary font-medium">{rate.category}</td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium">
                      {rate.rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{rate.description}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setTransactionData({...transactionData, taxRate: rate.rate.toString()})}
                      className="text-sm text-primary hover:text-primary-700 nav-transition font-medium"
                    >
                      Use Rate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Calculator */}
      <div className="bg-background rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Tax Calculator
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Transaction Amount
              </label>
              <input
                type="number"
                value={transactionData.amount}
                onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-border rounded-lg focus:border-border-focus focus:outline-none nav-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={transactionData.taxRate}
                onChange={(e) => setTransactionData({...transactionData, taxRate: e.target.value})}
                placeholder="Enter tax rate"
                className="w-full px-4 py-3 border border-border rounded-lg focus:border-border-focus focus:outline-none nav-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                HSN/SAC Code
              </label>
              <input
                type="text"
                value={transactionData.hsn}
                onChange={(e) => setTransactionData({...transactionData, hsn: e.target.value})}
                placeholder="Enter HSN/SAC code"
                className="w-full px-4 py-3 border border-border rounded-lg focus:border-border-focus focus:outline-none nav-transition"
              />
            </div>

            <button
              onClick={handleCalculation}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-700 nav-transition flex items-center justify-center space-x-2"
            >
              <Icon name="Calculator" size={16} color="white" />
              <span>Calculate Tax</span>
            </button>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <h4 className="font-medium text-text-primary mb-4">Calculation Result</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Base Amount:</span>
                <span className="text-text-primary font-medium">
                  ₹{transactionData.amount || '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax Rate:</span>
                <span className="text-text-primary font-medium">
                  {transactionData.taxRate || '0'}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax Amount:</span>
                <span className="text-text-primary font-medium">
                  ₹{transactionData.amount && transactionData.taxRate 
                    ? ((parseFloat(transactionData.amount) * parseFloat(transactionData.taxRate)) / 100).toFixed(2)
                    : '0.00'
                  }
                </span>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-text-primary font-medium">Total Amount:</span>
                  <span className="text-primary font-bold text-lg">
                    ₹{transactionData.amount && transactionData.taxRate 
                      ? (parseFloat(transactionData.amount) + ((parseFloat(transactionData.amount) * parseFloat(transactionData.taxRate)) / 100)).toFixed(2)
                      : '0.00'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculationModule;