'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const businessId = '00000000-0000-0000-0000-000000000010';
    
    const inventoryItems = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        business_id: businessId,
        name: 'Widget A',
        sku: 'WDG-A-001',
        description: 'Standard widget for general use',
        current_quantity: 100,
        current_cost: 500,
        opening_quantity: 100,
        opening_cost: 500,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        business_id: businessId,
        name: 'Widget B Premium',
        sku: 'WDG-B-001',
        description: 'Premium widget with enhanced features',
        current_quantity: 50,
        current_cost: 1000,
        opening_quantity: 50,
        opening_cost: 1000,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        business_id: businessId,
        name: 'Component X',
        sku: 'CMP-X-001',
        description: 'Essential component for assembly',
        current_quantity: 200,
        current_cost: 250,
        opening_quantity: 200,
        opening_cost: 250,
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('inventory_items', inventoryItems);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('inventory_items', null, {});
  }
};
