import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const DocumentCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    {
      id: 1,
      name: "Financial Statement - Q3 2024",
      type: "financial-statement",
      category: "Financial Reports",
      date: "2024-10-15",
      size: "2.4 MB",
      format: "PDF",
      status: "ready",
      description: "Quarterly financial statement including balance sheet, income statement, and cash flow"
    },
    {
      id: 2,
      name: "Tax Return - 2023",
      type: "tax-document",
      category: "Tax Documents",
      date: "2024-03-15",
      size: "1.8 MB",
      format: "PDF",
      status: "ready",
      description: "Annual tax return filing for fiscal year 2023"
    },
    {
      id: 3,
      name: "Invoice #INV-2024-0847",
      type: "invoice",
      category: "Invoices",
      date: "2024-11-01",
      size: "156 KB",
      format: "PDF",
      status: "ready",
      description: "Service invoice for October 2024 consulting services"
    },
    {
      id: 4,
      name: "Bank Statement - October 2024",
      type: "bank-statement",
      category: "Bank Statements",
      date: "2024-11-01",
      size: "892 KB",
      format: "PDF",
      status: "processing",
      description: "Monthly bank statement for primary business account"
    },
    {
      id: 5,
      name: "Expense Report - Q3 2024",
      type: "expense-report",
      category: "Financial Reports",
      date: "2024-10-30",
      size: "1.2 MB",
      format: "PDF",
      status: "ready",
      description: "Detailed expense breakdown for third quarter operations"
    },
    {
      id: 6,
      name: "GST Return - September 2024",
      type: "tax-document",
      category: "Tax Documents",
      date: "2024-10-10",
      size: "324 KB",
      format: "PDF",
      status: "ready",
      description: "Monthly GST return filing for September 2024"
    }
  ];

  const categories = [
    { id: 'all', label: 'All Documents', count: documents.length },
    { id: 'Financial Reports', label: 'Financial Reports', count: documents.filter(d => d.category === 'Financial Reports').length },
    { id: 'Tax Documents', label: 'Tax Documents', count: documents.filter(d => d.category === 'Tax Documents').length },
    { id: 'Invoices', label: 'Invoices', count: documents.filter(d => d.category === 'Invoices').length },
    { id: 'Bank Statements', label: 'Bank Statements', count: documents.filter(d => d.category === 'Bank Statements').length }
  ];

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'financial-statement':
        return 'BarChart3';
      case 'tax-document':
        return 'Calculator';
      case 'invoice':
        return 'Receipt';
      case 'bank-statement':
        return 'Building2';
      case 'expense-report':
        return 'PieChart';
      default:
        return 'FileText';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'text-success bg-success-100';
      case 'processing':
        return 'text-warning bg-warning-100';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (document) => {
    console.log('Downloading document:', document.name);
    // Mock download functionality
  };

  const handleUpload = () => {
    console.log('Opening upload dialog');
    // Mock upload functionality
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              color="var(--color-text-secondary)" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent outline-none nav-transition"
            />
          </div>
        </div>
        <button
          onClick={handleUpload}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 nav-transition flex items-center space-x-2"
        >
          <Icon name="Upload" size={16} color="white" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-lg border border-border p-4">
            <h3 className="font-heading font-semibold text-text-primary mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg nav-transition flex items-center justify-between
                    ${selectedCategory === category.id
                      ? 'bg-primary text-white' :'text-text-primary hover:bg-background'
                    }
                  `}
                >
                  <span className="text-sm">{category.label}</span>
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${selectedCategory === category.id
                      ? 'bg-white bg-opacity-20 text-white' :'bg-background text-text-secondary'
                    }
                  `}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3">
          <div className="bg-surface rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading font-semibold text-text-primary">
                Documents ({filteredDocuments.length})
              </h3>
            </div>
            
            <div className="divide-y divide-border">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="p-4 hover:bg-background nav-transition">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon 
                        name={getDocumentIcon(document.type)} 
                        size={24} 
                        color="var(--color-primary)" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary truncate">
                            {document.name}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {document.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                            <span>{document.date}</span>
                            <span>{document.size}</span>
                            <span className="uppercase">{document.format}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-4">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${getStatusColor(document.status)}
                          `}>
                            {document.status === 'ready' ? 'Ready' : 'Processing'}
                          </span>
                          
                          {document.status === 'ready' && (
                            <button
                              onClick={() => handleDownload(document)}
                              className="p-2 text-text-secondary hover:text-primary hover:bg-primary-100 rounded-lg nav-transition"
                              title="Download document"
                            >
                              <Icon name="Download" size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="p-8 text-center">
                <Icon name="FileX" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
                <h3 className="font-medium text-text-primary mb-2">No documents found</h3>
                <p className="text-text-secondary">
                  {searchTerm ? 'Try adjusting your search terms' : 'No documents available in this category'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCenter;