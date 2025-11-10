import React, { useState, useEffect } from 'react';
import { transactionService, chartAccountService, contactService } from '../services/api';

function Transactions({ business }) {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    type: 'receipt',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    contactId: '',
    amount: '',
    description: '',
    vatInclusive: false,
    isSalary: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) {
      loadData();
    }
  }, [business]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txnRes, accRes, conRes] = await Promise.all([
        transactionService.getAll(business.id),
        chartAccountService.getAll(business.id),
        contactService.getAll(business.id)
      ]);
      setTransactions(txnRes.data);
      setAccounts(accRes.data);
      setContacts(conRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionService.create(business.id, formData);
      setFormData({
        type: 'receipt',
        date: new Date().toISOString().split('T')[0],
        accountId: '',
        contactId: '',
        amount: '',
        description: '',
        vatInclusive: false,
        isSalary: false
      });
      loadData();
    } catch (error) {
      alert('Error creating transaction: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1>Transactions</h1>
      
      <div className="card">
        <h3>New Transaction</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="form-group">
              <label>Type</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} required>
                <option value="receipt">Receipt</option>
                <option value="payment">Payment</option>
                <option value="inventory_purchase">Inventory Purchase</option>
                <option value="inventory_sale">Inventory Sale</option>
                <option value="fixed_purchase">Fixed Asset Purchase</option>
                <option value="fixed_disposal">Fixed Asset Disposal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Account</label>
              <select value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})} required>
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Contact (Optional)</label>
              <select value={formData.contactId} onChange={(e) => setFormData({...formData, contactId: e.target.value})}>
                <option value="">Select Contact</option>
                {contacts.map(con => (
                  <option key={con.id} value={con.id}>{con.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.vatInclusive} onChange={(e) => setFormData({...formData, vatInclusive: e.target.checked})} />
              {' '}VAT Inclusive
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.isSalary} onChange={(e) => setFormData({...formData, isSalary: e.target.checked})} />
              {' '}Salary Transaction (PAYE applies)
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Create Transaction</button>
        </form>
      </div>

      <div className="card">
        <h3>Transaction List</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn.id}>
                <td>{txn.date}</td>
                <td>{txn.type}</td>
                <td>{txn.description}</td>
                <td>{txn.account?.name}</td>
                <td>₦{parseFloat(txn.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
