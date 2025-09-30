import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const InvoiceApproval = () => {
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const pendingInvoices = [
    {
      id: 1,
      invoiceNumber: "INV-2024-0851",
      vendor: "TechSolutions Inc.",
      description: "Monthly software licensing and technical support services for November 2024",
      amount: 4200.00,
      dueDate: "2024-11-25",
      category: "Technology",
      status: "pending_approval",
      submittedBy: "Michael Rodriguez",
      submittedDate: "2024-11-15",
      attachments: ["invoice_851.pdf", "purchase_order.pdf"]
    },
    {
      id: 2,
      invoiceNumber: "INV-2024-0852",
      vendor: "Office Supplies Co.",
      description: "Office supplies and stationery for Q4 operations including printer paper, pens, and folders",
      amount: 850.00,
      dueDate: "2024-11-30",
      category: "Operations",
      status: "pending_approval",
      submittedBy: "Sarah Chen",
      submittedDate: "2024-11-14",
      attachments: ["office_supplies_invoice.pdf"]
    },
    {
      id: 3,
      invoiceNumber: "INV-2024-0853",
      vendor: "Marketing Agency Pro",
      description: "Digital marketing campaign management and social media advertising for November 2024",
      amount: 6500.00,
      dueDate: "2024-12-01",
      category: "Marketing",
      status: "pending_approval",
      submittedBy: "Michael Rodriguez",
      submittedDate: "2024-11-13",
      attachments: ["marketing_invoice.pdf", "campaign_report.pdf"]
    },
    {
      id: 4,
      invoiceNumber: "INV-2024-0854",
      vendor: "Freelance Developer",
      description: "Website maintenance and feature development for client portal enhancements",
      amount: 3200.00,
      dueDate: "2024-11-28",
      category: "Technology",
      status: "pending_approval",
      submittedBy: "Sarah Chen",
      submittedDate: "2024-11-12",
      attachments: ["development_invoice.pdf"]
    }
  ];

  const approvedInvoices = [
    {
      id: 5,
      invoiceNumber: "INV-2024-0850",
      vendor: "Cloud Services Ltd.",
      description: "Monthly cloud hosting and backup services",
      amount: 1200.00,
      dueDate: "2024-11-20",
      category: "Technology",
      status: "approved",
      approvedBy: "You",
      approvedDate: "2024-11-10",
      paymentStatus: "paid"
    },
    {
      id: 6,
      invoiceNumber: "INV-2024-0849",
      vendor: "Legal Advisors Inc.",
      description: "Legal consultation and contract review services",
      amount: 2800.00,
      dueDate: "2024-11-18",
      category: "Professional Services",
      status: "approved",
      approvedBy: "You",
      approvedDate: "2024-11-08",
      paymentStatus: "scheduled"
    }
  ];

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === pendingInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(pendingInvoices.map(invoice => invoice.id));
    }
  };

  const handleApprove = (invoiceId) => {
    console.log('Approving invoice:', invoiceId);
    // Mock approval logic
  };

  const handleReject = (invoiceId) => {
    console.log('Rejecting invoice:', invoiceId);
    // Mock rejection logic
  };

  const handleBulkApprove = () => {
    console.log('Bulk approving invoices:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const formatAmount = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'text-warning bg-warning-100';
      case 'approved':
        return 'text-success bg-success-100';
      case 'rejected':
        return 'text-error bg-error-100';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-success bg-success-100';
      case 'scheduled':
        return 'text-secondary bg-secondary-100';
      case 'overdue':
        return 'text-error bg-error-100';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals Section */}
      <div className="bg-surface rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">
                Pending Approvals
              </h3>
              <p className="text-sm text-text-secondary">
                {pendingInvoices.length} invoices awaiting your approval
              </p>
            </div>
            
            {selectedInvoices.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary">
                  {selectedInvoices.length} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  className="bg-success text-white px-4 py-2 rounded-lg hover:bg-success-700 nav-transition flex items-center space-x-2"
                >
                  <Icon name="Check" size={16} color="white" />
                  <span>Approve Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="text-left py-3 px-6">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === pendingInvoices.length && pendingInvoices.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border focus:ring-border-focus"
                  />
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Invoice</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Vendor</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Due Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Category</th>
                <th className="text-center py-3 px-6 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-background nav-transition">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleSelectInvoice(invoice.id)}
                      className="rounded border-border focus:ring-border-focus"
                    />
                  </td>
                  
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Submitted by {invoice.submittedBy}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {formatDate(invoice.submittedDate)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {invoice.vendor}
                      </div>
                      <div className="text-xs text-text-secondary line-clamp-2 max-w-xs">
                        {invoice.description}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-text-primary">
                      {formatAmount(invoice.amount)}
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="text-sm text-text-primary">
                      {formatDate(invoice.dueDate)}
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                      {invoice.category}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleApprove(invoice.id)}
                        className="p-2 text-success hover:bg-success-100 rounded-lg nav-transition"
                        title="Approve invoice"
                      >
                        <Icon name="Check" size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(invoice.id)}
                        className="p-2 text-error hover:bg-error-100 rounded-lg nav-transition"
                        title="Reject invoice"
                      >
                        <Icon name="X" size={16} />
                      </button>
                      <button
                        className="p-2 text-text-secondary hover:bg-background rounded-lg nav-transition"
                        title="View details"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingInvoices.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" size={48} color="var(--color-success)" className="mx-auto mb-4" />
            <h3 className="font-medium text-text-primary mb-2">All caught up!</h3>
            <p className="text-text-secondary">No invoices pending approval at this time.</p>
          </div>
        )}
      </div>

      {/* Recently Approved Section */}
      <div className="bg-surface rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">
            Recently Approved
          </h3>
          <p className="text-sm text-text-secondary">Your recently approved invoices</p>
        </div>

        <div className="divide-y divide-border">
          {approvedInvoices.map((invoice) => (
            <div key={invoice.id} className="p-6 hover:bg-background nav-transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h4 className="font-medium text-text-primary">{invoice.invoiceNumber}</h4>
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${getStatusColor(invoice.status)}
                    `}>
                      Approved
                    </span>
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${getPaymentStatusColor(invoice.paymentStatus)}
                    `}>
                      {invoice.paymentStatus === 'paid' ? 'Paid' : 'Payment Scheduled'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Vendor: </span>
                      <span className="text-text-primary font-medium">{invoice.vendor}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Amount: </span>
                      <span className="text-text-primary font-medium">{formatAmount(invoice.amount)}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Approved: </span>
                      <span className="text-text-primary">{formatDate(invoice.approvedDate)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-text-secondary mt-2 line-clamp-1">
                    {invoice.description}
                  </p>
                </div>
                
                <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary-100 rounded-lg nav-transition ml-4">
                  <Icon name="Eye" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceApproval;