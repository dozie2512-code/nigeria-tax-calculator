module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'business_id',
      references: {
        model: 'businesses',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('customer', 'supplier', 'employee', 'other'),
      defaultValue: 'other',
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    // Statutory deductions for PAYE
    rentPaid: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'rent_paid',
    },
    mortgageInterest: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'mortgage_interest',
    },
    lifeAssurance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'life_assurance',
    },
    nhfContribution: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'nhf_contribution',
    },
    pensionContribution: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'pension_contribution',
    },
  }, {
    tableName: 'contacts',
    indexes: [
      { fields: ['business_id'] },
    ],
  });

  Contact.associate = (models) => {
    Contact.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
    Contact.hasMany(models.Transaction, {
      foreignKey: 'contact_id',
      as: 'transactions',
    });
  };

  return Contact;
};
