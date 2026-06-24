const { DataTypes, Model } = require('sequelize');

class Task extends Model {}

module.exports = (sequelize) => {
  Task.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium',
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
        defaultValue: 'pending',
      },
      dueDate: { type: DataTypes.DATE, allowNull: true },
      assignedToId: { type: DataTypes.UUID, allowNull: false },
      assignedById: { type: DataTypes.UUID, allowNull: false },
      completedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Task',
      tableName: 'tasks',
      timestamps: true,
    }
  );
  return Task;
};
