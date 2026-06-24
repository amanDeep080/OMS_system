const { DataTypes, Model } = require('sequelize');

class Notification extends Model {}

module.exports = (sequelize) => {
  Notification.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      type: {
        type: DataTypes.ENUM('leave', 'payroll', 'performance', 'announcement', 'system'),
        defaultValue: 'system',
      },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
      link: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: true,
    }
  );
  return Notification;
};
