module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Customer', 'Supplier', 'Employee', 'Other'),
      allowNull: false,
      defaultValue: 'Customer'
    },
    email: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    taxId: {
      type: DataTypes.STRING
    },
    // PAYE specific fields
    isEmployee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    basicSalary: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    housingAllowance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    transportAllowance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    otherAllowances: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    // Statutory deductions
    nhfContribution: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    pensionContribution: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    lifeAssurance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    mortgageInterest: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    rentPaid: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'contacts'
  });

  Contact.associate = (models) => {
    Contact.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
    Contact.hasMany(models.Transaction, {
      foreignKey: 'contactId',
      as: 'transactions'
    });
  };

  return Contact;
};
