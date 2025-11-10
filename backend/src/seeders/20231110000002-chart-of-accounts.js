'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const businessId = '00000000-0000-0000-0000-000000000010';
    
    const chartAccounts = [
      // Assets
      { id: '10000000-0000-0000-0000-000000000001', business_id: businessId, code: '1000', name: 'Cash', type: 'Asset', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000002', business_id: businessId, code: '1010', name: 'Bank Account', type: 'Asset', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000003', business_id: businessId, code: '1100', name: 'Accounts Receivable', type: 'Asset', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000004', business_id: businessId, code: '1200', name: 'Inventory', type: 'Asset', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000005', business_id: businessId, code: '1500', name: 'Fixed Assets', type: 'Asset', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      
      // Liabilities
      { id: '10000000-0000-0000-0000-000000000010', business_id: businessId, code: '2000', name: 'Accounts Payable', type: 'Liability', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000011', business_id: businessId, code: '2100', name: 'VAT Payable', type: 'Liability', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000012', business_id: businessId, code: '2110', name: 'WHT Payable', type: 'Liability', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      
      // Equity
      { id: '10000000-0000-0000-0000-000000000020', business_id: businessId, code: '3000', name: 'Share Capital', type: 'Equity', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000021', business_id: businessId, code: '3100', name: 'Retained Earnings', type: 'Equity', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      
      // Revenue
      { id: '10000000-0000-0000-0000-000000000030', business_id: businessId, code: '4000', name: 'Sales Revenue', type: 'Revenue', is_disallowable: false, is_non_taxable: false, is_revenue: true, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000031', business_id: businessId, code: '4100', name: 'Service Revenue', type: 'Revenue', is_disallowable: false, is_non_taxable: false, is_revenue: true, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000032', business_id: businessId, code: '4200', name: 'Interest Income', type: 'Revenue', is_disallowable: false, is_non_taxable: true, is_revenue: true, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      
      // Expenses
      { id: '10000000-0000-0000-0000-000000000040', business_id: businessId, code: '5000', name: 'Cost of Goods Sold', type: 'Expense', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000041', business_id: businessId, code: '5100', name: 'Salaries and Wages', type: 'Expense', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000042', business_id: businessId, code: '5200', name: 'Rent Expense', type: 'Expense', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: true, rent_frequency: 'monthly', is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000043', business_id: businessId, code: '5300', name: 'Utilities', type: 'Expense', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000044', business_id: businessId, code: '5400', name: 'Depreciation Expense', type: 'Expense', is_disallowable: true, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000045', business_id: businessId, code: '5500', name: 'Entertainment Expense', type: 'Expense', is_disallowable: true, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now },
      { id: '10000000-0000-0000-0000-000000000046', business_id: businessId, code: '5600', name: 'Office Supplies', type: 'Expense', is_disallowable: false, is_non_taxable: false, is_revenue: false, is_rent: false, rent_frequency: null, is_active: true, created_at: now, updated_at: now }
    ];

    await queryInterface.bulkInsert('chart_accounts', chartAccounts);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('chart_accounts', null, {});
  }
};
