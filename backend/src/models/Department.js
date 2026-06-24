const { DataTypes, Model } = require('sequelize');

class Department extends Model {}

module.exports = (sequelize) => {
  Department.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      headEmployeeId: { type: DataTypes.UUID, allowNull: true },
      budget: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      colorTag: { type: DataTypes.STRING(7), defaultValue: '#1F3A5F' },
    },
    {
      sequelize,
      modelName: 'Department',
      tableName: 'departments',
      timestamps: true,
    }
  );
  return Department;
};
