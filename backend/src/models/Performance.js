const { DataTypes, Model } = require('sequelize');

class Performance extends Model {}

module.exports = (sequelize) => {
  Performance.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      employeeId: { type: DataTypes.UUID, allowNull: false },
      reviewerId: { type: DataTypes.UUID, allowNull: true },
      quarter: { type: DataTypes.ENUM('Q1', 'Q2', 'Q3', 'Q4'), allowNull: false },
      year: { type: DataTypes.INTEGER, allowNull: false },
      kpiScore: { type: DataTypes.DECIMAL(5, 2), allowNull: false }, // out of 100
      rating: { type: DataTypes.INTEGER, allowNull: false }, // 1-5 stars
      goals: { type: DataTypes.JSONB, allowNull: true }, // [{title, status, progress}]
      strengths: { type: DataTypes.TEXT, allowNull: true },
      areasForImprovement: { type: DataTypes.TEXT, allowNull: true },
      managerFeedback: { type: DataTypes.TEXT, allowNull: true },
      reviewDate: { type: DataTypes.DATEONLY, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Performance',
      tableName: 'performance_reviews',
      timestamps: true,
      indexes: [{ unique: true, fields: ['employeeId', 'quarter', 'year'] }],
    }
  );
  return Performance;
};
