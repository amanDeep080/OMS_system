const { Op } = require('sequelize');
const { sequelize, Attendance, Employee } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

function getIST() {
  const now = new Date();
  // Create IST date object
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function todayStr() {
  const ist = getIST();
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, '0');
  const d = String(ist.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// POST /api/attendance/check-in
async function checkIn(req, res) {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile linked to this account' });

  const date = todayStr();
  const ist = getIST();

  // Format HH:MM:SS in IST
  const checkInTime = ist.toTimeString().slice(0, 8);

  // Shift Logic (IST)
  // Default start: 21:00:00 (9:00 PM)
  const hour = ist.getHours();
  const minute = ist.getMinutes();

  let status = 'present';
  if (hour > 21 || (hour === 21 && minute > 5)) {
    status = 'late';
  } else if (hour === 21 && minute > 0) {
    // 21:01 to 21:05 is grace period -> still marked 'present'
    status = 'present';
  } else if (hour < 21) {
    // Early check-in is also present
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

  const ist = getIST();
  const checkOutTimeStr = ist.toTimeString().slice(0, 8);

  // Calculate hours correctly by combining record date with check-in time
  // Since both are in IST relative strings, we treat them as such for calculation
  const checkInDateTime = new Date(`${record.date}T${record.checkIn}`);
  const checkOutDateTime = new Date(`${record.date}T${checkOutTimeStr}`);

  // If checkout is numerically before check-in, it's likely next day (for night shifts)
  let diff = checkOutDateTime - checkInDateTime;
  if (diff < 0) {
    // Add 24 hours
    diff += 24 * 60 * 60 * 1000;
  }

  const hours = Math.max(0, diff / 1000 / 3600);

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
