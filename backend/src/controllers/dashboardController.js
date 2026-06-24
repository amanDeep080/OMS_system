const { Op } = require('sequelize');
const {
  sequelize, Employee, Department, Attendance, Leave, Payroll,
  Performance, Announcement, Asset, Task, AuditLog, User,
  Kudos, Enrollment
} = require('../models');

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/dashboard/overview
async function overview(req, res) {
  try {
    const today = todayStr();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [
      totalEmployees,
      activeEmployees,
      presentToday,
      onLeaveToday,
      pendingLeaves,
      monthlyPayrollAgg,
      departmentStats,
      hiringTrends,
      avgPerformance,
      recentAnnouncements,
      upcomingBirthdays,
      newJoiners,
      recentLeaves,
      assetStats,
      taskStats,
      recentActivity,
      recentKudos,
      topPerformers,
      completedCourses,
      ongoingCourses,
    ] = await Promise.all([
      Employee.count(),
      Employee.count({ where: { employmentStatus: 'active' } }),
      Attendance.count({ where: { date: today, status: { [Op.in]: ['present', 'late', 'work_from_home', 'half_day'] } } }),
      Employee.count({ where: { employmentStatus: 'on_leave' } }),
      Leave.count({ where: { status: 'pending' } }),
      Payroll.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('netPay')), 'total']],
        where: { month: currentMonth, year: currentYear },
        raw: true,
      }),
      Employee.findAll({
        attributes: ['departmentId', [sequelize.fn('COUNT', sequelize.col('Employee.id')), 'count']],
        where: { employmentStatus: 'active' },
        include: [{ model: Department, as: 'department', attributes: ['name'] }],
        group: ['departmentId', 'department.id', 'department.name'],
        raw: true,
      }),
      Employee.findAll({
        attributes: [
          [sequelize.fn('to_char', sequelize.col('joiningDate'), 'YYYY-MM'), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'hires'],
        ],
        where: { joiningDate: { [Op.gte]: new Date(currentYear - 1, currentMonth, 1) } },
        group: [sequelize.fn('to_char', sequelize.col('joiningDate'), 'YYYY-MM')],
        order: [[sequelize.fn('to_char', sequelize.col('joiningDate'), 'YYYY-MM'), 'ASC']],
        raw: true,
      }),
      Performance.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'], [sequelize.fn('AVG', sequelize.col('kpiScore')), 'avgKpi']],
        where: { year: currentYear },
        raw: true,
      }),
      Announcement.findAll({ order: [['postedAt', 'DESC']], limit: 5 }),
      Employee.findAll({
        where: sequelize.where(
          sequelize.fn('date_part', 'month', sequelize.col('dateOfBirth')),
          currentMonth
        ),
        limit: 5,
        attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'profilePicture']
      }),
      Employee.findAll({
        where: {
          joiningDate: { [Op.gte]: new Date(currentYear, now.getMonth(), 1) }
        },
        limit: 5,
        order: [['joiningDate', 'DESC']],
        attributes: ['id', 'firstName', 'lastName', 'joiningDate', 'profilePicture', 'designation']
      }),
      Leave.findAll({
        where: { status: 'pending' },
        include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'profilePicture'] }],
        limit: 5,
        order: [['createdAt', 'DESC']]
      }),
      Asset.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true
      }),
      Task.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true
      }),
      AuditLog.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['email'] }]
      }),
      Kudos.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Employee, as: 'giver', attributes: ['firstName', 'lastName'] },
          { model: Employee, as: 'receiver', attributes: ['firstName', 'lastName', 'profilePicture'] }
        ]
      }),
      Performance.findAll({
        limit: 5,
        order: [['rating', 'DESC'], ['kpiScore', 'DESC']],
        include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'profilePicture', 'designation'] }]
      }),
      Enrollment.count({ where: { status: 'completed' } }),
      Enrollment.count({ where: { status: 'in_progress' } }),
    ]);

    const newHiresThisMonth = await Employee.count({
      where: {
        joiningDate: { [Op.gte]: new Date(currentYear, now.getMonth(), 1) }
      }
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        attendanceToday: presentToday,
        onLeaveToday,
        pendingLeaves,
        monthlyPayroll: Number(monthlyPayrollAgg?.total || 0),
        newHiresThisMonth,
        departmentStats,
        hiringTrends,
        performance: {
          avgRating: Number(avgPerformance?.avgRating || 0).toFixed(2),
          avgKpiScore: Number(avgPerformance?.avgKpi || 0).toFixed(2),
        },
        recentAnnouncements,
        upcomingBirthdays,
        newJoiners,
        recentLeaves,
        assetStats,
        taskStats,
        recentActivity,
        recentKudos,
        topPerformers,
        learning: {
          completed: completedCourses,
          ongoing: ongoingCourses
        }
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { overview };
