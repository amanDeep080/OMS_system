const { DataTypes, Model } = require('sequelize');

class Attendance extends Model {}

module.exports = (sequelize) => {
  Attendance.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      employeeId: { type: DataTypes.UUID, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'work_from_home', 'on_leave', 'holiday', 'weekend'),
        allowNull: false,
      },
      checkIn: { type: DataTypes.TIME, allowNull: true },
      checkOut: { type: DataTypes.TIME, allowNull: true },
      hoursWorked: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0 },
      overtimeHours: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'Attendance',
      tableName: 'attendance',
      timestamps: true,
      indexes: [{ unique: true, fields: ['employeeId', 'date'] }],
    }
  );
  return Attendance;
};
