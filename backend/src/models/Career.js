const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Goal extends Model {}
  Goal.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    targetDate: { type: DataTypes.DATEONLY },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('active', 'completed', 'cancelled'), defaultValue: 'active' },
    type: { type: DataTypes.ENUM('personal', 'team', 'okr'), defaultValue: 'personal' },
  }, { sequelize, modelName: 'Goal', tableName: 'goals' });

  class InternalJob extends Model {}
  InternalJob.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    departmentId: { type: DataTypes.UUID },
    location: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM('full_time', 'transfer', 'promotion'), defaultValue: 'full_time' },
    status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
  }, { sequelize, modelName: 'InternalJob', tableName: 'internal_jobs' });

  class TimelineEvent extends Model {}
  TimelineEvent.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    type: { type: DataTypes.STRING }, // promotion, salary_change, award, certification
    details: { type: DataTypes.JSONB },
  }, { sequelize, modelName: 'TimelineEvent', tableName: 'career_timeline' });

  return { Goal, InternalJob, TimelineEvent };
};
