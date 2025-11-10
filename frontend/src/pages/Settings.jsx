import React, { useState, useEffect } from 'react';
import { businessService } from '../services/api';

function Settings({ business }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) loadSettings();
  }, [business]);

  const loadSettings = async () => {
    try {
      const res = await businessService.getSettings(business.id);
      setSettings(res.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await businessService.updateSettings(business.id, settings);
      alert('Settings updated successfully');
    } catch (error) {
      alert('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1>Business Settings</h1>
      
      <div className="card">
        <h3>Tax Configuration</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="form-group">
              <label>Business Name</label>
              <input value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Business Type</label>
              <select value={settings.businessType} onChange={(e) => setSettings({...settings, businessType: e.target.value})} required>
                <option value="Company">Company</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
              </select>
            </div>
            <div className="form-group">
              <label>VAT Rate (%)</label>
              <input type="number" step="0.01" value={settings.vatRate} onChange={(e) => setSettings({...settings, vatRate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>WHT Rate (%)</label>
              <input type="number" step="0.01" value={settings.whtRate} onChange={(e) => setSettings({...settings, whtRate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>CIT Rate (%)</label>
              <input type="number" step="0.01" value={settings.citRate} onChange={(e) => setSettings({...settings, citRate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Depreciation Rate (%)</label>
              <input type="number" step="0.01" value={settings.depreciationRate} onChange={(e) => setSettings({...settings, depreciationRate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Capital Allowance Rate (%)</label>
              <input type="number" step="0.01" value={settings.capitalAllowanceRate} onChange={(e) => setSettings({...settings, capitalAllowanceRate: e.target.value})} />
            </div>
          </div>

          <h4 style={{ marginTop: '20px' }}>Brought Forward Amounts</h4>
          <div className="grid">
            <div className="form-group">
              <label>Loss Relief B/F</label>
              <input type="number" step="0.01" value={settings.lossReliefBf} onChange={(e) => setSettings({...settings, lossReliefBf: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Capital Allowance B/F</label>
              <input type="number" step="0.01" value={settings.capitalAllowanceBf} onChange={(e) => setSettings({...settings, capitalAllowanceBf: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Chargeable Loss B/F</label>
              <input type="number" step="0.01" value={settings.chargeableLossBf} onChange={(e) => setSettings({...settings, chargeableLossBf: e.target.value})} />
            </div>
          </div>

          <h4 style={{ marginTop: '20px' }}>Tax Toggles</h4>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.vatEnabled} onChange={(e) => setSettings({...settings, vatEnabled: e.target.checked})} />
              {' '}Enable VAT
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.whtEnabled} onChange={(e) => setSettings({...settings, whtEnabled: e.target.checked})} />
              {' '}Enable WHT
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.payeEnabled} onChange={(e) => setSettings({...settings, payeEnabled: e.target.checked})} />
              {' '}Enable PAYE
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
