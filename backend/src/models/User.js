const { DataTypes, Model } = require('sequelize');

class User extends Model {}

module.exports = (sequelize) => {
  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      employeeId: { type: DataTypes.UUID, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('super_admin', 'hr', 'manager', 'employee'),
        allowNull: false,
        defaultValue: 'employee',
      },
      isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      refreshToken: { type: DataTypes.TEXT, allowNull: true },
      resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
      resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true },
      themePreference: { type: DataTypes.ENUM('light', 'dark'), defaultValue: 'light' },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    }
  );
  return User;
};
