const { DataTypes, Model } = require('sequelize');

class Payroll extends Model {}

module.exports = (sequelize) => {
  Payroll.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      employeeId: { type: DataTypes.UUID, allowNull: false },
      payslipNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
      month: { type: DataTypes.INTEGER, allowNull: false }, // 1-12
      year: { type: DataTypes.INTEGER, allowNull: false },
      basic: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      hra: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      otherAllowances: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      bonus: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      incentives: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      providentFund: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      otherDeductions: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      grossPay: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      netPay: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      status: { type: DataTypes.ENUM('paid', 'pending', 'processing'), defaultValue: 'paid' },
      paidOn: { type: DataTypes.DATEONLY, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Payroll',
      tableName: 'payroll',
      timestamps: true,
      indexes: [{ unique: true, fields: ['employeeId', 'month', 'year'] }],
    }
  );
  return Payroll;
};
