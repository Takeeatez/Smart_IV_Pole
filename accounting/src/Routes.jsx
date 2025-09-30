import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import Login from "pages/login";
import Dashboard from "pages/dashboard";
import TransactionsManagement from "pages/transactions-management";
import FinancialReports from "pages/financial-reports";
import BankReconciliation from "pages/bank-reconciliation";
import ClientPortal from "pages/client-portal";
import TaxComplianceCenter from "pages/tax-compliance-center";
import UserManagement from "pages/user-management";
import WardOverviewDashboard from "pages/ward-overview-dashboard";
import PatientManagement from "pages/patient-management";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions-management" element={<TransactionsManagement />} />
          <Route path="/financial-reports" element={<FinancialReports />} />
          <Route path="/bank-reconciliation" element={<BankReconciliation />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/tax-compliance-center" element={<TaxComplianceCenter />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/ward-overview-dashboard" element={<WardOverviewDashboard />} />
          <Route path="/patient-management" element={<PatientManagement />} />
          <Route path="/" element={<WardOverviewDashboard />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;