'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const businessId = '00000000-0000-0000-0000-000000000010';
    
    const contacts = [
      {
        id: '40000000-0000-0000-0000-000000000001',
        business_id: businessId,
        name: 'ABC Corporation',
        email: 'contact@abc-corp.com',
        phone: '+234-800-1234-001',
        type: 'Customer',
        rent_relief: false,
        mortgage_interest: 0,
        life_assurance: 0,
        nhf: 0,
        pension: 0,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        business_id: businessId,
        name: 'XYZ Supplies Ltd',
        email: 'info@xyz-supplies.com',
        phone: '+234-800-5678-002',
        type: 'Supplier',
        rent_relief: false,
        mortgage_interest: 0,
        life_assurance: 0,
        nhf: 0,
        pension: 0,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: '40000000-0000-0000-0000-000000000003',
        business_id: businessId,
        name: 'John Doe',
        email: 'john.doe@demo.test',
        phone: '+234-800-9999-003',
        type: 'Employee',
        rent_relief: true,
        mortgage_interest: 50000,
        life_assurance: 10000,
        nhf: 15000,
        pension: 25000,
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('contacts', contacts);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('contacts', null, {});
  }
};
