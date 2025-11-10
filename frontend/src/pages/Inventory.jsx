import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/api';

function Inventory({ business }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ name: '', sku: '', description: '' });
  const [transactionForm, setTransactionForm] = useState({
    itemId: '',
    type: 'purchase',
    quantity: '',
    unitCost: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (business) loadItems();
  }, [business]);

  const loadItems = async () => {
    try {
      const res = await inventoryService.getAll(business.id);
      setItems(res.data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.create(business.id, formData);
      setFormData({ name: '', sku: '', description: '' });
      loadItems();
    } catch (error) {
      alert('Error creating item');
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      const { itemId, type, quantity, unitCost, date } = transactionForm;
      if (type === 'purchase') {
        await inventoryService.purchase(business.id, itemId, { quantity, unitCost, date });
      } else {
        await inventoryService.sale(business.id, itemId, { quantity, date });
      }
      setTransactionForm({ itemId: '', type: 'purchase', quantity: '', unitCost: '', date: new Date().toISOString().split('T')[0] });
      loadItems();
    } catch (error) {
      alert('Error processing transaction: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      <p>Weighted-average costing method is used for inventory valuation.</p>

      <div className="grid">
        <div className="card">
          <h3>Add New Item</h3>
          <form onSubmit={handleCreateItem}>
            <div className="form-group">
              <label>Name</label>
              <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Add Item</button>
          </form>
        </div>

        <div className="card">
          <h3>Purchase / Sale</h3>
          <form onSubmit={handleTransaction}>
            <div className="form-group">
              <label>Item</label>
              <select value={transactionForm.itemId} onChange={(e) => setTransactionForm({...transactionForm, itemId: e.target.value})} required>
                <option value="">Select Item</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name} (Qty: {item.currentQuantity}, Avg Cost: ₦{item.currentCost})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={transactionForm.type} onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})} required>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" step="0.01" value={transactionForm.quantity} onChange={(e) => setTransactionForm({...transactionForm, quantity: e.target.value})} required />
            </div>
            {transactionForm.type === 'purchase' && (
              <div className="form-group">
                <label>Unit Cost</label>
                <input type="number" step="0.01" value={transactionForm.unitCost} onChange={(e) => setTransactionForm({...transactionForm, unitCost: e.target.value})} required />
              </div>
            )}
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={transactionForm.date} onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary">Process Transaction</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3>Inventory Items</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Weighted Avg Cost</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.currentQuantity}</td>
                <td>₦{parseFloat(item.currentCost).toLocaleString()}</td>
                <td>₦{(parseFloat(item.currentQuantity) * parseFloat(item.currentCost)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;
