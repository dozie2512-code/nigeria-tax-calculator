import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import Transactions from './pages/Transactions';
import Inventory from './pages/Inventory';
import FixedAssets from './pages/FixedAssets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import BankReconciliation from './pages/BankReconciliation';
import Contacts from './pages/Contacts';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/fixed-assets" element={<FixedAssets />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/bank-reconciliation" element={<BankReconciliation />} />
                    <Route path="/reports/*" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
