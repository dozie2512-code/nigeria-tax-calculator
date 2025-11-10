import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Inventory from './pages/Inventory';
import FixedAssets from './pages/FixedAssets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const business = localStorage.getItem('currentBusiness');
    setIsAuthenticated(!!token);
    if (business) {
      setCurrentBusiness(JSON.parse(business));
    }
  }, []);

  const handleLogin = (token, business) => {
    localStorage.setItem('token', token);
    localStorage.setItem('currentBusiness', JSON.stringify(business));
    setIsAuthenticated(true);
    setCurrentBusiness(business);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentBusiness');
    setIsAuthenticated(false);
    setCurrentBusiness(null);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Navigation business={currentBusiness} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard business={currentBusiness} />} />
          <Route path="/transactions" element={<Transactions business={currentBusiness} />} />
          <Route path="/inventory" element={<Inventory business={currentBusiness} />} />
          <Route path="/fixed-assets" element={<FixedAssets business={currentBusiness} />} />
          <Route path="/reports" element={<Reports business={currentBusiness} />} />
          <Route path="/settings" element={<Settings business={currentBusiness} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
