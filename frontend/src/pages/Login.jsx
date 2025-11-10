import React, { useState } from 'react';
import { authService } from '../services/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authService.login(email, password);
      const { token, businesses } = response.data;
      
      if (businesses && businesses.length > 0) {
        onLogin(token, businesses[0]);
      } else {
        setError('No business associated with this account');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <div style={{ marginTop: '15px' }}>
            <p>Demo credentials: admin@demo.test / Password123!</p>
            <a href="/register">Register new account</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
