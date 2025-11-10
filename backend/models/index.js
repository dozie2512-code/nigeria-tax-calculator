const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require('./User')(sequelize, Sequelize.DataTypes),
  Business: require('./Business')(sequelize, Sequelize.DataTypes),
  BusinessUser: require('./BusinessUser')(sequelize, Sequelize.DataTypes),
  ChartAccount: require('./ChartAccount')(sequelize, Sequelize.DataTypes),
  Transaction: require('./Transaction')(sequelize, Sequelize.DataTypes),
  InventoryItem: require('./InventoryItem')(sequelize, Sequelize.DataTypes),
  InventoryTransaction: require('./InventoryTransaction')(sequelize, Sequelize.DataTypes),
  FixedAsset: require('./FixedAsset')(sequelize, Sequelize.DataTypes),
  Contact: require('./Contact')(sequelize, Sequelize.DataTypes),
  BankStatement: require('./BankStatement')(sequelize, Sequelize.DataTypes),
  BankReconciliation: require('./BankReconciliation')(sequelize, Sequelize.DataTypes),
  BusinessSettings: require('./BusinessSettings')(sequelize, Sequelize.DataTypes),
};

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
