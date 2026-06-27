const { Op } = require('sequelize');
const { sequelize, Attendance, Employee } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// POST /api/attendance/check-in
async function checkIn(req, res) {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile linked to this account' });

  const date = todayStr();
  const now = new Date();
  const checkInTime = now.toTimeString().slice(0, 8); // HH:MM:SS

  // Shift Logic
  // Default start: 21:00:00 (9:00 PM)
  const hour = now.getHours();
  const minute = now.getMinutes();

  let status = 'present';
  if (hour > 21 || (hour === 21 && minute > 5)) {
    status = 'late';
  } else if (hour === 21 && minute > 0) {
    // 21:01 to 21:05 is grace period -> still marked 'present'
    status = 'present';
  }

  const [record, created] = await Attendance.findOrCreate({
    where: { employeeId, date },
    defaults: { employeeId, date, status, checkIn: checkInTime },
  });

  if (!created) {
    return res.status(400).json({ success: false, message: 'Already checked in for today' });
  }

  res.status(201).json({ success: true, data: record });
}

// POST /api/attendance/check-out
async function checkOut(req, res) {
  const employeeId = req.user.employeeId;

  // Find the most recent record for this employee that doesn't have a check-out yet
  const record = await Attendance.findOne({
    where: {
      employeeId,
      checkOut: null
    },
    order: [['date', 'DESC']]
  });

  if (!record) return res.status(400).json({ success: false, message: 'No active check-in found' });

  const now = new Date();
  const checkOutTimeStr = now.toTimeString().slice(0, 8);

  // Calculate hours correctly by combining record date with check-in time
  const checkInDateTime = new Date(`${record.date}T${record.checkIn}`);
  const hours = Math.max(0, (now - checkInDateTime) / 1000 / 3600);

  await record.update({
    checkOut: checkOutTimeStr,
    hoursWorked: hours.toFixed(2),
    overtimeHours: Math.max(0, hours - 8).toFixed(2),
  });

  res.json({ success: true, data: record });
}

// GET /api/attendance/me?month=&year=
async function myAttendance(req, res) {
  const employeeId = req.user.employeeId;
  const { month, year } = req.query;
  const where = { employeeId };

  if (month && year) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    where.date = { [Op.between]: [start, end] };
  }

  const records = await Attendance.findAll({ where, order: [['date', 'DESC']] });
  res.json({ success: true, data: records });
}

// GET /api/attendance/employee/:employeeId
async function employeeAttendance(req, res) {
  const { page, limit, offset } = paginate(req, 31);
  const { month, year } = req.query;
  const where = { employeeId: req.params.employeeId };

  if (month && year) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    where.date = { [Op.between]: [start, end] };
  }

  const result = await Attendance.findAndCountAll({ where, limit, offset, order: [['date', 'DESC']] });
  paginatedResponse(res, result, page, limit);
}

// GET /api/attendance/team/:managerId  -> attendance for direct reports, for today
async function teamAttendanceToday(req, res) {
  const reports = await Employee.findAll({ where: { managerId: req.params.managerId }, attributes: ['id'] });
  const ids = reports.map((r) => r.id);

  const records = await Attendance.findAll({
    where: { employeeId: { [Op.in]: ids }, date: todayStr() },
    include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'employeeCode'] }],
  });

  res.json({ success: true, data: records });
}

// GET /api/attendance/stats/today
async function statsToday(req, res) {
  const date = todayStr();
  const counts = await Attendance.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { date },
    group: ['status'],
    raw: true,
  });
  const totalEmployees = await Employee.count({ where: { employmentStatus: 'active' } });

  res.json({
    success: true,
    data: {
      date,
      totalEmployees,
      breakdown: counts.map((c) => ({ status: c.status, count: Number(c.count) })),
    },
  });
}

// GET /api/attendance/stats/trends?months=6
async function attendanceTrends(req, res) {
  const months = Number(req.query.months) || 6;
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const records = await Attendance.findAll({
    attributes: [
      [sequelize.fn('to_char', sequelize.col('date'), 'YYYY-MM'), 'month'],
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: { date: { [Op.gte]: since.toISOString().slice(0, 10) } },
    group: [sequelize.fn('to_char', sequelize.col('date'), 'YYYY-MM'), 'status'],
    order: [[sequelize.fn('to_char', sequelize.col('date'), 'YYYY-MM'), 'ASC']],
    raw: true,
  });

  res.json({ success: true, data: records });
}

module.exports = {
  checkIn,
  checkOut,
  myAttendance,
  employeeAttendance,
  teamAttendanceToday,
  statsToday,
  attendanceTrends,
};
