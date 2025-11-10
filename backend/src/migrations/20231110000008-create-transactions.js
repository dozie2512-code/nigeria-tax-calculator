'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
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
      account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chart_accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      contact_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'contacts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      inventory_item_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'inventory_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fixed_asset_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'fixed_assets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('receipt', 'payment', 'inventory_purchase', 'inventory_sale', 'fixed_purchase', 'fixed_disposal'),
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      vat_amount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      vat_inclusive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      wht_amount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      wht_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      wht_calculation_mode: {
        type: Sequelize.ENUM('gross', 'net'),
        defaultValue: 'gross'
      },
      is_salary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      paye_amount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: true
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

    await queryInterface.addIndex('transactions', ['business_id']);
    await queryInterface.addIndex('transactions', ['account_id']);
    await queryInterface.addIndex('transactions', ['date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};
