const sequelize = require('../config/db');

const User = require('./User')(sequelize);
const Department = require('./Department')(sequelize);
const Employee = require('./Employee')(sequelize);
const Attendance = require('./Attendance')(sequelize);
const Leave = require('./Leave')(sequelize);
const Payroll = require('./Payroll')(sequelize);
const Performance = require('./Performance')(sequelize);
const Announcement = require('./Announcement')(sequelize);
const Notification = require('./Notification')(sequelize);
const Document = require('./Document')(sequelize);
const Task = require('./Task')(sequelize);
const Asset = require('./Asset')(sequelize);
const Ticket = require('./Ticket')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const Expense = require('./Expense')(sequelize);
const { Post, Comment, Reaction } = require('./Social')(sequelize);
const { Course, Enrollment, Skill, EmployeeSkill } = require('./Learning')(sequelize);
const { Kudos, Reward, RewardTransaction } = require('./Engagement')(sequelize);
const { Goal, InternalJob, TimelineEvent } = require('./Career')(sequelize);
const { Club, ClubMembership, Event } = require('./Community')(sequelize);

// ---- Associations ----

// Department <-> Employee
Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// Department head
Department.belongsTo(Employee, { foreignKey: 'headEmployeeId', as: 'head', constraints: false });

// Employee self-referential manager relationship
Employee.belongsTo(Employee, { foreignKey: 'managerId', as: 'manager' });
Employee.hasMany(Employee, { foreignKey: 'managerId', as: 'directReports' });

// User <-> Employee (1:1)
User.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasOne(User, { foreignKey: 'employeeId', as: 'account' });

// Employee <-> Attendance
Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendanceRecords', onDelete: 'CASCADE' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Employee <-> Leave
Employee.hasMany(Leave, { foreignKey: 'employeeId', as: 'leaveRequests', onDelete: 'CASCADE' });
Leave.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Leave.belongsTo(Employee, { foreignKey: 'approvedById', as: 'approver', constraints: false });

// Employee <-> Payroll
Employee.hasMany(Payroll, { foreignKey: 'employeeId', as: 'payrollRecords', onDelete: 'CASCADE' });
Payroll.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Employee <-> Performance
Employee.hasMany(Performance, { foreignKey: 'employeeId', as: 'performanceReviews', onDelete: 'CASCADE' });
Performance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Performance.belongsTo(Employee, { foreignKey: 'reviewerId', as: 'reviewer', constraints: false });

// Employee <-> Document
Employee.hasMany(Document, { foreignKey: 'employeeId', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Announcement <-> Employee (author)
Announcement.belongsTo(Employee, { foreignKey: 'postedById', as: 'author', constraints: false });
Announcement.belongsTo(Department, { foreignKey: 'targetDepartmentId', as: 'targetDepartment', constraints: false });

// Employee <-> Task
Employee.hasMany(Task, { foreignKey: 'assignedToId', as: 'assignedTasks' });
Task.belongsTo(Employee, { foreignKey: 'assignedToId', as: 'assignee' });
Task.belongsTo(Employee, { foreignKey: 'assignedById', as: 'creator' });

// Employee <-> Asset
Employee.hasMany(Asset, { foreignKey: 'employeeId', as: 'assets' });
Asset.belongsTo(Employee, { foreignKey: 'employeeId', as: 'user' });

// Employee <-> Ticket
Employee.hasMany(Ticket, { foreignKey: 'employeeId', as: 'tickets' });
Ticket.belongsTo(Employee, { foreignKey: 'employeeId', as: 'requester' });
Ticket.belongsTo(Employee, { foreignKey: 'assignedToId', as: 'assignee' });

// Employee <-> Expense
Employee.hasMany(Expense, { foreignKey: 'employeeId', as: 'expenses' });
Expense.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Expense.belongsTo(Employee, { foreignKey: 'approvedById', as: 'approver' });

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'logs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Social Associations
Employee.hasMany(Post, { foreignKey: 'employeeId', as: 'posts' });
Post.belongsTo(Employee, { foreignKey: 'employeeId', as: 'author' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(Employee, { foreignKey: 'employeeId', as: 'author' });
Post.hasMany(Reaction, { foreignKey: 'postId', as: 'reactions' });
Reaction.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Reaction.belongsTo(Employee, { foreignKey: 'employeeId', as: 'user' });

// Recognition
Employee.hasMany(Kudos, { foreignKey: 'receiverId', as: 'recognitionsReceived' });
Employee.hasMany(Kudos, { foreignKey: 'giverId', as: 'recognitionsGiven' });
Kudos.belongsTo(Employee, { foreignKey: 'receiverId', as: 'receiver' });
Kudos.belongsTo(Employee, { foreignKey: 'giverId', as: 'giver' });

// Learning & Skills
Employee.belongsToMany(Skill, { through: EmployeeSkill, foreignKey: 'employeeId', as: 'employeeSkills' });
Skill.belongsToMany(Employee, { through: EmployeeSkill, foreignKey: 'skillId', as: 'experts' });
Employee.hasMany(Enrollment, { foreignKey: 'employeeId', as: 'enrollments' });
Enrollment.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });

// Career & Goals
Employee.hasMany(Goal, { foreignKey: 'employeeId', as: 'goals' });
Goal.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(TimelineEvent, { foreignKey: 'employeeId', as: 'careerTimeline' });
TimelineEvent.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Community
Employee.belongsToMany(Club, { through: ClubMembership, foreignKey: 'employeeId', as: 'clubMemberships' });
Club.belongsToMany(Employee, { through: ClubMembership, foreignKey: 'clubId', as: 'members' });

module.exports = {
  sequelize,
  User,
  Department,
  Employee,
  Attendance,
  Leave,
  Payroll,
  Performance,
  Announcement,
  Notification,
  Document,
  Task,
  Asset,
  Ticket,
  AuditLog,
  Expense,
  Post,
  Comment,
  Reaction,
  Course,
  Enrollment,
  Skill,
  EmployeeSkill,
  Kudos,
  Reward,
  RewardTransaction,
  Goal,
  InternalJob,
  TimelineEvent,
  Club,
  ClubMembership,
  Event,
};
