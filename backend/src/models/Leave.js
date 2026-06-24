const { DataTypes, Model } = require('sequelize');

class Leave extends Model {}

module.exports = (sequelize) => {
  Leave.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      employeeId: { type: DataTypes.UUID, allowNull: false },
      leaveType: {
        type: DataTypes.ENUM('sick_leave', 'casual_leave', 'earned_leave', 'maternity_leave', 'paternity_leave', 'unpaid_leave'),
        allowNull: false,
      },
      startDate: { type: DataTypes.DATEONLY, allowNull: false },
      endDate: { type: DataTypes.DATEONLY, allowNull: false },
      totalDays: { type: DataTypes.DECIMAL(4, 1), allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending',
      },
      appliedOn: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      approvedById: { type: DataTypes.UUID, allowNull: true },
      decisionNote: { type: DataTypes.TEXT, allowNull: true },
      decidedOn: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Leave',
      tableName: 'leaves',
      timestamps: true,
    }
  );
  return Leave;
};
