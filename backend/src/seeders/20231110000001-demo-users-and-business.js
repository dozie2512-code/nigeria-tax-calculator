'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('crypto').randomUUID ? require('crypto') : { randomUUID: () => uuidv4() };

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Create users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    const users = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@demo.test',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'manager@demo.test',
        password: hashedPassword,
        first_name: 'Manager',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'accountant@demo.test',
        password: hashedPassword,
        first_name: 'Accountant',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        email: 'viewer@demo.test',
        password: hashedPassword,
        first_name: 'Viewer',
        last_name: 'User',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // Create business
    const business = {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Demo Trading Company Ltd',
      business_type: 'Company',
      vat_rate: 7.5,
      wht_rate: 5.0,
      cit_rate: 25.0,
      capital_allowance_rate: 20.0,
      depreciation_rate: 10.0,
      chargeable_loss_bf: 0,
      capital_allowance_bf: 0,
      loss_relief_bf: 0,
      vat_enabled: true,
      wht_enabled: true,
      paye_enabled: true,
      created_at: now,
      updated_at: now
    };

    await queryInterface.bulkInsert('businesses', [business]);

    // Create business-user relationships
    const businessUsers = [
      {
        id: '00000000-0000-0000-0000-000000000020',
        user_id: '00000000-0000-0000-0000-000000000001',
        business_id: '00000000-0000-0000-0000-000000000010',
        role: 'Admin',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '00000000-0000-0000-0000-000000000021',
        user_id: '00000000-0000-0000-0000-000000000002',
        business_id: '00000000-0000-0000-0000-000000000010',
        role: 'Manager',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '00000000-0000-0000-0000-000000000022',
        user_id: '00000000-0000-0000-0000-000000000003',
        business_id: '00000000-0000-0000-0000-000000000010',
        role: 'Accountant',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '00000000-0000-0000-0000-000000000023',
        user_id: '00000000-0000-0000-0000-000000000004',
        business_id: '00000000-0000-0000-0000-000000000010',
        role: 'Viewer',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('business_users', businessUsers);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('business_users', null, {});
    await queryInterface.bulkDelete('businesses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
