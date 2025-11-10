'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('businesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      business_type: {
        type: Sequelize.ENUM('Sole Proprietor', 'Company'),
        allowNull: false,
        defaultValue: 'Company'
      },
      vat_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 7.5
      },
      wht_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 5.0
      },
      cit_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 25.0
      },
      capital_allowance_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 20.0
      },
      depreciation_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 10.0
      },
      chargeable_loss_bf: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      capital_allowance_bf: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      loss_relief_bf: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      vat_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      wht_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      paye_enabled: {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('businesses');
  }
};
