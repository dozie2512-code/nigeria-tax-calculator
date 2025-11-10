'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fixed_assets', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      depreciation_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      capital_allowance_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      is_chargeable: {
        type: Sequelize.ENUM('FIXED', 'CHARGEABLE'),
        allowNull: false,
        defaultValue: 'FIXED'
      },
      opening_balance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      accumulated_depreciation: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      capital_allowance_bf: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      chargeable_loss_bf: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      disposal_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      disposal_proceeds: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      is_disposed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.addIndex('fixed_assets', ['business_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fixed_assets');
  }
};
