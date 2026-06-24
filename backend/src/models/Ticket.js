const { DataTypes, Model } = require('sequelize');

class Ticket extends Model {}

module.exports = (sequelize) => {
  Ticket.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      subject: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      category: {
        type: DataTypes.ENUM('it', 'hr', 'finance', 'facilities', 'other'),
        defaultValue: 'it',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open',
      },
      employeeId: { type: DataTypes.UUID, allowNull: false },
      assignedToId: { type: DataTypes.UUID, allowNull: true },
      resolvedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Ticket',
      tableName: 'tickets',
      timestamps: true,
    }
  );
  return Ticket;
};
