'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const businessId = '00000000-0000-0000-0000-000000000010';
    
    const fixedAssets = [
      {
        id: '30000000-0000-0000-0000-000000000001',
        business_id: businessId,
        name: 'Office Computer',
        description: 'Desktop computer for office use',
        purchase_date: '2023-01-15',
        cost: 1500000,
        depreciation_rate: 20.0,
        capital_allowance_rate: 20.0,
        is_chargeable: 'FIXED',
        opening_balance: true,
        accumulated_depreciation: 150000,
        capital_allowance_bf: 0,
        chargeable_loss_bf: 0,
        disposal_date: null,
        disposal_proceeds: null,
        is_disposed: false,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        business_id: businessId,
        name: 'Delivery Vehicle',
        description: 'Toyota Hilux for deliveries',
        purchase_date: '2022-06-01',
        cost: 15000000,
        depreciation_rate: 25.0,
        capital_allowance_rate: 25.0,
        is_chargeable: 'FIXED',
        opening_balance: true,
        accumulated_depreciation: 5625000,
        capital_allowance_bf: 0,
        chargeable_loss_bf: 0,
        disposal_date: null,
        disposal_proceeds: null,
        is_disposed: false,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        business_id: businessId,
        name: 'Investment Property',
        description: 'Commercial property at Victoria Island',
        purchase_date: '2021-03-01',
        cost: 50000000,
        depreciation_rate: 0,
        capital_allowance_rate: 0,
        is_chargeable: 'CHARGEABLE',
        opening_balance: true,
        accumulated_depreciation: 0,
        capital_allowance_bf: 0,
        chargeable_loss_bf: 0,
        disposal_date: null,
        disposal_proceeds: null,
        is_disposed: false,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '30000000-0000-0000-0000-000000000004',
        business_id: businessId,
        name: 'Old Equipment (Disposed)',
        description: 'Manufacturing equipment - sold',
        purchase_date: '2020-01-01',
        cost: 5000000,
        depreciation_rate: 20.0,
        capital_allowance_rate: 20.0,
        is_chargeable: 'FIXED',
        opening_balance: true,
        accumulated_depreciation: 3000000,
        capital_allowance_bf: 0,
        chargeable_loss_bf: 0,
        disposal_date: '2023-09-01',
        disposal_proceeds: 2500000,
        is_disposed: true,
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('fixed_assets', fixedAssets);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('fixed_assets', null, {});
  }
};
