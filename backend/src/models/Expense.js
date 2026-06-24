const { DataTypes, Model } = require('sequelize');

class Expense extends Model {}

module.exports = (sequelize) => {
  Expense.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      category: {
        type: DataTypes.ENUM('travel', 'food', 'internet', 'medical', 'office_supplies', 'other'),
        defaultValue: 'other',
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
        defaultValue: 'pending',
      },
      employeeId: { type: DataTypes.UUID, allowNull: false },
      attachmentUrl: { type: DataTypes.STRING, allowNull: true },
      approvedById: { type: DataTypes.UUID, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Expense',
      tableName: 'expenses',
      timestamps: true,
    }
  );
  return Expense;
};
