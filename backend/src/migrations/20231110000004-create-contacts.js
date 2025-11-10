'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contacts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('Customer', 'Supplier', 'Employee', 'Other'),
        defaultValue: 'Other'
      },
      rent_relief: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mortgage_interest: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      life_assurance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      nhf: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      pension: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('contacts', ['business_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contacts');
  }
};
