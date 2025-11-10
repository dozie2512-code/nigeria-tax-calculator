'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reconciliation_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      bank_transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bank_transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      match_type: {
        type: Sequelize.ENUM('auto', 'manual'),
        defaultValue: 'manual'
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

    await queryInterface.addIndex('reconciliation_entries', ['bank_transaction_id']);
    await queryInterface.addIndex('reconciliation_entries', ['transaction_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reconciliation_entries');
  }
};
