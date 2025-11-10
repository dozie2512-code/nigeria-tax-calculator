'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const accountantPassword = await bcrypt.hash('accountant123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);

    // Create users
    const users = await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'manager@example.com',
        password: managerPassword,
        firstName: 'Manager',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'accountant@example.com',
        password: accountantPassword,
        firstName: 'Accountant',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'viewer@example.com',
        password: viewerPassword,
        firstName: 'Viewer',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Create a sample business
    await queryInterface.bulkInsert('businesses', [{
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Sample Trading Company Ltd',
      businessType: 'Company',
      registrationNumber: 'RC123456',
      address: '123 Marina Street, Lagos, Nigeria',
      phone: '+234 800 000 0000',
      email: 'info@sampletrading.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Associate users with business
    await queryInterface.bulkInsert('business_users', [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        role: 'Admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        role: 'Manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440003',
        userId: '550e8400-e29b-41d4-a716-446655440003',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        role: 'Accountant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440004',
        userId: '550e8400-e29b-41d4-a716-446655440004',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        role: 'Viewer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create business settings
    await queryInterface.bulkInsert('business_settings', [{
      id: '880e8400-e29b-41d4-a716-446655440001',
      businessId: '660e8400-e29b-41d4-a716-446655440001',
      defaultVatRate: 7.5,
      defaultWhtRate: 5,
      citRate: 25,
      defaultDepreciationRate: 10,
      defaultCapitalAllowanceRate: 25,
      lossReliefBf: 0,
      capitalAllowanceBf: 0,
      chargeableLossBf: 0,
      vatEnabled: true,
      whtEnabled: true,
      citEnabled: true,
      pitEnabled: false,
      payeEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Create sample chart of accounts
    await queryInterface.bulkInsert('chart_accounts', [
      // Assets
      {
        id: '990e8400-e29b-41d4-a716-446655440001',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '1000',
        name: 'Cash',
        type: 'Asset',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 1000000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440002',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '1100',
        name: 'Bank',
        type: 'Asset',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 5000000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440003',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '1200',
        name: 'Accounts Receivable',
        type: 'Asset',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440004',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '1300',
        name: 'Inventory',
        type: 'Asset',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440005',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '1400',
        name: 'Fixed Assets',
        type: 'Asset',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Revenue
      {
        id: '990e8400-e29b-41d4-a716-446655440006',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '4000',
        name: 'Sales Revenue',
        type: 'Revenue',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: true,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440007',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '4100',
        name: 'Service Revenue',
        type: 'Revenue',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: true,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // COGS
      {
        id: '990e8400-e29b-41d4-a716-446655440008',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '5000',
        name: 'Cost of Goods Sold',
        type: 'COGS',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Expenses
      {
        id: '990e8400-e29b-41d4-a716-446655440009',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '6000',
        name: 'Salaries and Wages',
        type: 'Expense',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440010',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '6100',
        name: 'Rent Expense',
        type: 'Expense',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: true,
        rentFrequency: 'Monthly',
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440011',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '6200',
        name: 'Depreciation Expense',
        type: 'Expense',
        isDisallowable: false,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440012',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        code: '6300',
        name: 'Entertainment Expense',
        type: 'Expense',
        isDisallowable: true,
        isNonTaxable: false,
        isRevenue: false,
        isRent: false,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create sample inventory items
    await queryInterface.bulkInsert('inventory_items', [
      {
        id: 'aa0e8400-e29b-41d4-a716-446655440001',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Product A',
        sku: 'PROD-A-001',
        description: 'Sample product A for inventory',
        costingMethod: 'weighted-average',
        currentQuantity: 100,
        currentCost: 1000,
        sellingPrice: 1500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'aa0e8400-e29b-41d4-a716-446655440002',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Product B',
        sku: 'PROD-B-001',
        description: 'Sample product B for inventory',
        costingMethod: 'weighted-average',
        currentQuantity: 50,
        currentCost: 2000,
        sellingPrice: 3000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create sample fixed assets (including one chargeable)
    await queryInterface.bulkInsert('fixed_assets', [
      {
        id: 'bb0e8400-e29b-41d4-a716-446655440001',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Company Vehicle',
        description: 'Toyota Corolla 2022',
        assetTag: 'VEH-001',
        purchaseDate: new Date('2023-01-15'),
        cost: 5000000,
        depreciationRate: 20,
        capitalAllowanceRate: 25,
        isChargeable: 'FIXED',
        openingBalance: false,
        accumulatedDepreciation: 833333.33,
        capitalAllowanceBf: 0,
        chargeableLossBf: 0,
        isDisposed: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'bb0e8400-e29b-41d4-a716-446655440002',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Office Building',
        description: 'Commercial property in Victoria Island',
        assetTag: 'PROP-001',
        purchaseDate: new Date('2022-06-01'),
        cost: 50000000,
        depreciationRate: 5,
        capitalAllowanceRate: 10,
        isChargeable: 'CHARGEABLE',
        openingBalance: false,
        accumulatedDepreciation: 4166666.67,
        capitalAllowanceBf: 0,
        chargeableLossBf: 0,
        isDisposed: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'bb0e8400-e29b-41d4-a716-446655440003',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Old Equipment (Disposed)',
        description: 'Manufacturing equipment sold in 2024',
        assetTag: 'EQUIP-001',
        purchaseDate: new Date('2020-01-01'),
        cost: 3000000,
        depreciationRate: 25,
        capitalAllowanceRate: 25,
        isChargeable: 'CHARGEABLE',
        openingBalance: false,
        accumulatedDepreciation: 3000000,
        capitalAllowanceBf: 0,
        chargeableLossBf: 500000,
        disposalDate: new Date('2024-06-01'),
        disposalAmount: 2000000,
        disposalProfit: -1000000,
        chargeableGain: 0,
        chargeableLoss: 500000,
        isDisposed: true,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create sample contacts
    await queryInterface.bulkInsert('contacts', [
      {
        id: 'cc0e8400-e29b-41d4-a716-446655440001',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'John Doe',
        type: 'Employee',
        email: 'john.doe@example.com',
        phone: '+234 800 111 1111',
        isEmployee: true,
        basicSalary: 500000,
        housingAllowance: 200000,
        transportAllowance: 50000,
        otherAllowances: 50000,
        nhfContribution: 12500,
        pensionContribution: 40000,
        lifeAssurance: 10000,
        mortgageInterest: 0,
        rentPaid: 100000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cc0e8400-e29b-41d4-a716-446655440002',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'ABC Suppliers Ltd',
        type: 'Supplier',
        email: 'info@abcsuppliers.com',
        phone: '+234 800 222 2222',
        isEmployee: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cc0e8400-e29b-41d4-a716-446655440003',
        businessId: '660e8400-e29b-41d4-a716-446655440001',
        name: 'XYZ Customer Ltd',
        type: 'Customer',
        email: 'info@xyzcustomer.com',
        phone: '+234 800 333 3333',
        isEmployee: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('contacts', null, {});
    await queryInterface.bulkDelete('fixed_assets', null, {});
    await queryInterface.bulkDelete('inventory_items', null, {});
    await queryInterface.bulkDelete('chart_accounts', null, {});
    await queryInterface.bulkDelete('business_settings', null, {});
    await queryInterface.bulkDelete('business_users', null, {});
    await queryInterface.bulkDelete('businesses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
