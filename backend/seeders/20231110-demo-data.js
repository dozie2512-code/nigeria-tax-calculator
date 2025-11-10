'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Create users
    const adminId = uuidv4();
    const managerId = uuidv4();
    const accountantId = uuidv4();
    const viewerId = uuidv4();
    
    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 10),
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: managerId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        first_name: 'Manager',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: accountantId,
        email: 'accountant@example.com',
        password: await bcrypt.hash('password123', 10),
        first_name: 'Accountant',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: viewerId,
        email: 'viewer@example.com',
        password: await bcrypt.hash('password123', 10),
        first_name: 'Viewer',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
    
    // Create business
    const businessId = uuidv4();
    await queryInterface.bulkInsert('businesses', [
      {
        id: businessId,
        name: 'Demo Company Ltd',
        type: 'company',
        email: 'demo@company.com',
        phone: '+234-800-123-4567',
        address: '123 Business Street, Lagos, Nigeria',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
    
    // Link users to business
    await queryInterface.bulkInsert('business_users', [
      {
        id: uuidv4(),
        user_id: adminId,
        business_id: businessId,
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: managerId,
        business_id: businessId,
        role: 'manager',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: accountantId,
        business_id: businessId,
        role: 'accountant',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: viewerId,
        business_id: businessId,
        role: 'viewer',
        created_at: now,
        updated_at: now,
      },
    ]);
    
    // Create business settings
    await queryInterface.bulkInsert('business_settings', [
      {
        id: uuidv4(),
        business_id: businessId,
        vat_rate: 7.5,
        wht_rate: 5,
        cit_rate: 25,
        depreciation_rate: 10,
        capital_allowance_rate: 20,
        chargeable_loss_bf: 0,
        capital_allowance_bf: 0,
        loss_relief_bf: 0,
        unrelieved_capital_allowance: 0,
        vat_enabled: true,
        wht_enabled: true,
        paye_enabled: true,
        pit_enabled: false,
        cit_enabled: true,
        created_at: now,
        updated_at: now,
      },
    ]);
    
    // Create sample chart of accounts
    const accounts = [
      { code: '1000', name: 'Cash', type: 'asset', is_revenue: false, is_disallowable: false },
      { code: '1100', name: 'Bank', type: 'asset', is_revenue: false, is_disallowable: false },
      { code: '1200', name: 'Accounts Receivable', type: 'asset', is_revenue: false, is_disallowable: false },
      { code: '1300', name: 'Inventory', type: 'asset', is_revenue: false, is_disallowable: false },
      { code: '1500', name: 'Fixed Assets', type: 'asset', is_revenue: false, is_disallowable: false },
      { code: '2000', name: 'Accounts Payable', type: 'liability', is_revenue: false, is_disallowable: false },
      { code: '3000', name: 'Share Capital', type: 'equity', is_revenue: false, is_disallowable: false },
      { code: '4000', name: 'Sales Revenue', type: 'revenue', is_revenue: true, is_disallowable: false },
      { code: '4100', name: 'Service Revenue', type: 'revenue', is_revenue: true, is_disallowable: false },
      { code: '5000', name: 'Cost of Goods Sold', type: 'expense', is_revenue: false, is_disallowable: false },
      { code: '6000', name: 'Salaries & Wages', type: 'expense', is_revenue: false, is_disallowable: false },
      { code: '6100', name: 'Rent Expense', type: 'expense', is_revenue: false, is_disallowable: false, is_rent: true, rent_frequency: 'monthly' },
      { code: '6200', name: 'Depreciation Expense', type: 'expense', is_revenue: false, is_disallowable: false },
      { code: '6300', name: 'Entertainment (Disallowable)', type: 'expense', is_revenue: false, is_disallowable: true },
      { code: '7000', name: 'Disposal Profit', type: 'revenue', is_revenue: false, is_disallowable: false, is_disposal_profit: true },
      { code: '7100', name: 'Disposal Loss', type: 'expense', is_revenue: false, is_disallowable: false, is_disposal_loss: true },
    ];
    
    await queryInterface.bulkInsert('chart_accounts', accounts.map(acc => ({
      id: uuidv4(),
      business_id: businessId,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      is_disallowable: acc.is_disallowable || false,
      is_non_taxable: acc.is_non_taxable || false,
      is_revenue: acc.is_revenue || false,
      is_rent: acc.is_rent || false,
      rent_frequency: acc.rent_frequency || null,
      is_disposal_profit: acc.is_disposal_profit || false,
      is_disposal_loss: acc.is_disposal_loss || false,
      parent_id: null,
      is_active: true,
      created_at: now,
      updated_at: now,
    })));
    
    // Create sample contacts
    await queryInterface.bulkInsert('contacts', [
      {
        id: uuidv4(),
        business_id: businessId,
        name: 'John Doe (Employee)',
        type: 'employee',
        email: 'john.doe@example.com',
        phone: '+234-800-111-2222',
        address: 'Lagos, Nigeria',
        rent_paid: 1200000,
        mortgage_interest: 0,
        life_assurance: 100000,
        nhf_contribution: 50000,
        pension_contribution: 200000,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        business_id: businessId,
        name: 'ABC Suppliers Ltd',
        type: 'supplier',
        email: 'info@abcsuppliers.com',
        phone: '+234-800-333-4444',
        address: 'Lagos, Nigeria',
        rent_paid: 0,
        mortgage_interest: 0,
        life_assurance: 0,
        nhf_contribution: 0,
        pension_contribution: 0,
        created_at: now,
        updated_at: now,
      },
    ]);
    
    console.log('Demo data seeded successfully!');
    console.log('Login credentials:');
    console.log('  Admin: admin@example.com / password123');
    console.log('  Manager: manager@example.com / password123');
    console.log('  Accountant: accountant@example.com / password123');
    console.log('  Viewer: viewer@example.com / password123');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('business_users', null, {});
    await queryInterface.bulkDelete('chart_accounts', null, {});
    await queryInterface.bulkDelete('contacts', null, {});
    await queryInterface.bulkDelete('business_settings', null, {});
    await queryInterface.bulkDelete('businesses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
