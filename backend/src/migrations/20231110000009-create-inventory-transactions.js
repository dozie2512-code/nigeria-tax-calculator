'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      inventory_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'inventory_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('purchase', 'sale', 'adjustment', 'opening_balance'),
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit_cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      total_cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      running_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      running_cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      weighted_avg_cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
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

    await queryInterface.addIndex('inventory_transactions', ['inventory_item_id']);
    await queryInterface.addIndex('inventory_transactions', ['transaction_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory_transactions');
  }
};
