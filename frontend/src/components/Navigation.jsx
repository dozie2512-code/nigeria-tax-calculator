import React from 'react';
import { Link } from 'react-router-dom';

function Navigation({ business, onLogout }) {
  return (
    <nav className="nav">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><Link to="/fixed-assets">Fixed Assets</Link></li>
        <li><Link to="/reports">Reports</Link></li>
        <li><Link to="/settings">Settings</Link></li>
        <li style={{ marginLeft: 'auto' }}>
          <span style={{ color: 'white', marginRight: '20px' }}>
            {business?.name}
          </span>
          <button onClick={onLogout} className="btn btn-secondary">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
