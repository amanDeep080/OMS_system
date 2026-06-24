const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Model {}
  Course.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING },
    thumbnail: { type: DataTypes.STRING },
    duration: { type: DataTypes.INTEGER }, // in minutes
    difficulty: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
  }, { sequelize, modelName: 'Course', tableName: 'courses' });

  class Enrollment extends Model {}
  Enrollment.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    courseId: { type: DataTypes.UUID, allowNull: false },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('enrolled', 'in_progress', 'completed'), defaultValue: 'enrolled' },
    completedAt: { type: DataTypes.DATE },
  }, { sequelize, modelName: 'Enrollment', tableName: 'enrollments' });

  class Skill extends Model {}
  Skill.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    category: { type: DataTypes.STRING },
  }, { sequelize, modelName: 'Skill', tableName: 'skills' });

  class EmployeeSkill extends Model {}
  EmployeeSkill.init({
    employeeId: { type: DataTypes.UUID, primaryKey: true },
    skillId: { type: DataTypes.UUID, primaryKey: true },
    level: { type: DataTypes.INTEGER, defaultValue: 1 }, // 1-5
  }, { sequelize, modelName: 'EmployeeSkill', tableName: 'employee_skills' });

  return { Course, Enrollment, Skill, EmployeeSkill };
};
