import React from 'react';

function Dashboard({ business }) {
  return (
    <div>
      <h1>Dashboard - {business?.name}</h1>
      <div className="grid">
        <div className="card">
          <h3>Quick Stats</h3>
          <p>View your business overview and key metrics here.</p>
        </div>
        <div className="card">
          <h3>Recent Activity</h3>
          <p>Recent transactions and updates will appear here.</p>
        </div>
        <div className="card">
          <h3>Tax Summary</h3>
          <p>VAT, WHT, and CIT/PIT summaries will be displayed here.</p>
        </div>
      </div>
      <div className="card">
        <h3>Welcome to Nigeria Accounting System MVP</h3>
        <p>This is a multi-user, multi-business accounting application with Nigerian tax compliance features.</p>
        <h4>Features:</h4>
        <ul>
          <li>Multi-user access with role-based permissions (Admin, Manager, Accountant, Viewer)</li>
          <li>Comprehensive chart of accounts</li>
          <li>Transaction management (receipts, payments, inventory, fixed assets)</li>
          <li>Inventory management with weighted-average costing</li>
          <li>Fixed asset management with depreciation and capital allowances</li>
          <li>VAT, WHT, and PAYE calculations</li>
          <li>CIT computation for companies</li>
          <li>PIT computation for sole proprietors</li>
          <li>Bank reconciliation</li>
          <li>Comprehensive reports with Excel and PDF export</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
