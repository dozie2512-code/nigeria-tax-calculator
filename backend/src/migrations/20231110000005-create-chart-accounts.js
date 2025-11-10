'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chart_accounts', {
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
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense'),
        allowNull: false
      },
      is_disallowable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_non_taxable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_revenue: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_rent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      rent_frequency: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: true
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

    await queryInterface.addIndex('chart_accounts', ['business_id']);
    await queryInterface.addIndex('chart_accounts', ['code']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chart_accounts');
  }
};
