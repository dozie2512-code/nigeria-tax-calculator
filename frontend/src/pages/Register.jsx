import React, { useState } from 'react';
import { authService } from '../services/api';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    businessName: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authService.register(formData);
      const { token, business } = response.data;
      onLogin(token, business);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Business Name</label>
            <input value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn btn-primary">Register</button>
          <div style={{ marginTop: '15px' }}>
            <a href="/login">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
