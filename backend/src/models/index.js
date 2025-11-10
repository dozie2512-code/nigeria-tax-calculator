const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js');

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
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user')(sequelize, DataTypes);
db.Business = require('./business')(sequelize, DataTypes);
db.BusinessUser = require('./businessUser')(sequelize, DataTypes);
db.ChartAccount = require('./chartAccount')(sequelize, DataTypes);
db.Transaction = require('./transaction')(sequelize, DataTypes);
db.Contact = require('./contact')(sequelize, DataTypes);
db.InventoryItem = require('./inventoryItem')(sequelize, DataTypes);
db.InventoryTransaction = require('./inventoryTransaction')(sequelize, DataTypes);
db.FixedAsset = require('./fixedAsset')(sequelize, DataTypes);
db.BankTransaction = require('./bankTransaction')(sequelize, DataTypes);
db.Reconciliation = require('./reconciliation')(sequelize, DataTypes);
db.BusinessSettings = require('./businessSettings')(sequelize, DataTypes);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
