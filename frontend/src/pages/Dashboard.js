import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Nigeria Accounting System</div>
        <div className="navbar-menu">
          <span>{user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </nav>
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome to Your Dashboard</h1>
          <p className="dashboard-subtitle">
            Multi-user, multi-business accounting application MVP
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-title">Businesses</div>
            <div className="stat-value">{user?.businesses?.length || 0}</div>
            <div className="stat-change positive">Active</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value">₦0.00</div>
            <div className="stat-change">This month</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value">₦0.00</div>
            <div className="stat-change">This month</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Net Profit</div>
            <div className="stat-value">₦0.00</div>
            <div className="stat-change">This month</div>
          </div>
        </div>

        <div className="card">
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn btn-primary">Create Business</button>
            <button className="btn btn-success">New Transaction</button>
            <button className="btn btn-secondary">View Reports</button>
          </div>
        </div>

        <div className="card">
          <h2>Recent Transactions</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            No transactions yet. Start by creating a business and posting your first transaction.
          </p>
        </div>

        <div className="card">
          <h2>System Features</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✓ Multi-tenant business management</li>
            <li>✓ Role-based access control (Admin, Manager, Accountant, Viewer)</li>
            <li>✓ Chart of accounts with tax flags</li>
            <li>✓ Transaction posting (receipts, payments, inventory, fixed assets)</li>
            <li>✓ Automated depreciation (monthly cron job)</li>
            <li>✓ VAT, WHT, PAYE, CIT, and PIT calculations</li>
            <li>✓ Chargeable asset tracking with gain/loss computation</li>
            <li>✓ Bank reconciliation with CSV upload</li>
            <li>✓ Reports export to Excel and PDF</li>
            <li>✓ File uploads to MinIO S3-compatible storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
