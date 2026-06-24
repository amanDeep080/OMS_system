const { DataTypes, Model } = require('sequelize');

class Announcement extends Model {}

module.exports = (sequelize) => {
  Announcement.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      category: {
        type: DataTypes.ENUM('hiring', 'results', 'event', 'office_update', 'holiday', 'recognition', 'general'),
        defaultValue: 'general',
      },
      postedById: { type: DataTypes.UUID, allowNull: true },
      audienceRole: {
        type: DataTypes.ENUM('all', 'super_admin', 'hr', 'manager', 'employee'),
        defaultValue: 'all',
      },
      targetDepartmentId: { type: DataTypes.UUID, allowNull: true },
      isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
      postedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Announcement',
      tableName: 'announcements',
      timestamps: true,
    }
  );
  return Announcement;
};
