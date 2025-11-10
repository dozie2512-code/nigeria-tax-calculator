'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_items', {
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
      sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      current_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      current_cost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      opening_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      opening_cost: {
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

    await queryInterface.addIndex('inventory_items', ['business_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory_items');
  }
};
