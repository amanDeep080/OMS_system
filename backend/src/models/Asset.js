const { DataTypes, Model } = require('sequelize');

class Asset extends Model {}

module.exports = (sequelize) => {
  Asset.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      type: {
        type: DataTypes.ENUM('laptop', 'monitor', 'phone', 'keycard', 'headset', 'other'),
        defaultValue: 'laptop',
      },
      serialNumber: { type: DataTypes.STRING, unique: true },
      status: {
        type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'retired'),
        defaultValue: 'available',
      },
      employeeId: { type: DataTypes.UUID, allowNull: true },
      assignedAt: { type: DataTypes.DATE, allowNull: true },
      specifications: { type: DataTypes.JSONB, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'Asset',
      tableName: 'assets',
      timestamps: true,
    }
  );
  return Asset;
};
