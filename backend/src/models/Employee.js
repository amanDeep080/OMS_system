const { DataTypes, Model } = require('sequelize');

class Employee extends Model {}

module.exports = (sequelize) => {
  Employee.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      employeeCode: { type: DataTypes.STRING(10), allowNull: false, unique: true }, // EMP001
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING, allowNull: false },
      gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
      dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
      departmentId: { type: DataTypes.UUID, allowNull: true },
      designation: { type: DataTypes.STRING, allowNull: false },
      managerId: { type: DataTypes.UUID, allowNull: true },
      employmentType: {
        type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
        defaultValue: 'full_time',
      },
      employmentStatus: {
        type: DataTypes.ENUM('active', 'on_leave', 'terminated', 'resigned'),
        defaultValue: 'active',
      },
      joiningDate: { type: DataTypes.DATEONLY, allowNull: false },
      exitDate: { type: DataTypes.DATEONLY, allowNull: true },
      annualSalary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      profilePicture: { type: DataTypes.STRING, allowNull: true },
      bio: { type: DataTypes.TEXT, allowNull: true },
      rewardPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
      interests: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      languages: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      address: { type: DataTypes.JSONB, allowNull: true },
      emergencyContact: { type: DataTypes.JSONB, allowNull: true },
      bankDetails: { type: DataTypes.JSONB, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Employee',
      tableName: 'employees',
      timestamps: true,
    }
  );
  return Employee;
};
