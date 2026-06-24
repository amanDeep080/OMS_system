const { DataTypes, Model } = require('sequelize');

class AuditLog extends Model {}

module.exports = (sequelize) => {
  AuditLog.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: true },
      action: { type: DataTypes.STRING, allowNull: false },
      module: { type: DataTypes.STRING, allowNull: false },
      details: { type: DataTypes.JSONB, defaultValue: {} },
      ipAddress: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'audit_logs',
      timestamps: true,
      updatedAt: false,
    }
  );
  return AuditLog;
};
