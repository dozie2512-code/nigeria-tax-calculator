import React, { useState, useEffect } from 'react';
import { fixedAssetService } from '../services/api';

function FixedAssets({ business }) {
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    cost: '',
    depreciationRate: '10',
    capitalAllowanceRate: '20',
    isChargeable: 'FIXED'
  });

  useEffect(() => {
    if (business) loadAssets();
  }, [business]);

  const loadAssets = async () => {
    try {
      const res = await fixedAssetService.getAll(business.id);
      setAssets(res.data);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fixedAssetService.create(business.id, formData);
      setFormData({
        name: '',
        description: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        cost: '',
        depreciationRate: '10',
        capitalAllowanceRate: '20',
        isChargeable: 'FIXED'
      });
      loadAssets();
    } catch (error) {
      alert('Error creating asset');
    }
  };

  const handleRunDepreciation = async () => {
    try {
      await fixedAssetService.runDepreciation(business.id);
      alert('Depreciation run successfully');
      loadAssets();
    } catch (error) {
      alert('Error running depreciation');
    }
  };

  return (
    <div>
      <h1>Fixed Assets</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleRunDepreciation} className="btn btn-primary">
          Run Monthly Depreciation
        </button>
      </div>

      <div className="card">
        <h3>Add Fixed Asset</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="form-group">
              <label>Name</label>
              <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Cost</label>
              <input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Depreciation Rate (%)</label>
              <input type="number" step="0.01" value={formData.depreciationRate} onChange={(e) => setFormData({...formData, depreciationRate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Capital Allowance Rate (%)</label>
              <input type="number" step="0.01" value={formData.capitalAllowanceRate} onChange={(e) => setFormData({...formData, capitalAllowanceRate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Asset Type</label>
              <select value={formData.isChargeable} onChange={(e) => setFormData({...formData, isChargeable: e.target.value})} required>
                <option value="FIXED">Fixed Asset</option>
                <option value="CHARGEABLE">Chargeable Asset</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary">Add Asset</button>
        </form>
      </div>

      <div className="card">
        <h3>Fixed Assets List</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Purchase Date</th>
              <th>Cost</th>
              <th>Accumulated Depreciation</th>
              <th>Net Book Value</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => {
              const nbv = parseFloat(asset.cost) - parseFloat(asset.accumulatedDepreciation);
              return (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.purchaseDate}</td>
                  <td>₦{parseFloat(asset.cost).toLocaleString()}</td>
                  <td>₦{parseFloat(asset.accumulatedDepreciation).toLocaleString()}</td>
                  <td>₦{nbv.toLocaleString()}</td>
                  <td>{asset.isChargeable}</td>
                  <td>{asset.isDisposed ? 'Disposed' : 'Active'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FixedAssets;
