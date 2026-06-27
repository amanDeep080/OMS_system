const { Op } = require('sequelize');
const { sequelize, Attendance, Employee } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

/**
 * Get current time in India Standard Time (IST)
 * Returns an object with date string, time string, and hours/minutes
 */
function getISTData() {
  const now = new Date();

  // Formatters for IST
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const dateStr = dateFormatter.format(now); // YYYY-MM-DD
  const timeStr = timeFormatter.format(now); // HH:MM:SS

  const [hour, minute] = timeStr.split(':').map(Number);

  return { dateStr, timeStr, hour, minute };
}

// POST /api/attendance/check-in
async function checkIn(req, res) {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile linked to this account' });

  const { dateStr, timeStr, hour, minute } = getISTData();

  // Shift Logic: 9:00 PM (21:00)
  // If checking in after 9:05 PM (21:05), mark as late.
  // Note: If checking in after midnight (e.g., 00:10 AM), it's also late for the 9 PM shift.
  // We'll assume a "shift window". If it's between 9 PM and 6 AM, it's part of the night shift.

  let status = 'present';

  // Logic for 9:00 PM start:
  // 1. If hour is 21 (9 PM) and minute > 5 -> Late
  // 2. If hour is > 21 (10 PM, 11 PM) -> Late
  // 3. If hour is < 6 (12 AM to 6 AM) -> Late (Checking in very late for the night shift)

  if (hour === 21 && minute > 5) {
    status = 'late';
  } else if (hour > 21 || hour < 6) {
    status = 'late';
  }

  // Determine the "Attendance Date"
  // If it's between 00:00 and 06:00, we associate it with the previous day's shift
  let attendanceDate = dateStr;
  if (hour < 6) {
    const d = new Date(new Date(dateStr).getTime() - 24 * 60 * 60 * 1000);
    attendanceDate = d.toISOString().slice(0, 10);
  }

  const [record, created] = await Attendance.findOrCreate({
    where: { employeeId, date: attendanceDate },
    defaults: {
      employeeId,
      date: attendanceDate,
      status,
      checkIn: timeStr
    },
  });

  if (!created) {
    return res.status(400).json({ success: false, message: 'Already checked in for this session' });
  }

  res.status(201).json({ success: true, data: record });
}

// POST /api/attendance/check-out
async function checkOut(req, res) {
  const employeeId = req.user.employeeId;

  const record = await Attendance.findOne({
    where: {
      employeeId,
      checkOut: null
    },
    order: [['date', 'DESC'], ['createdAt', 'DESC']]
  });

  if (!record) return res.status(400).json({ success: false, message: 'No active check-in found' });

  const { timeStr } = getISTData();

  // Calculate hours
  const checkInTime = new Date(`${record.date}T${record.checkIn}`);

  // For checkout, we need to handle the case where it's the next day
  const { dateStr } = getISTData();
  let checkOutDateTime = new Date(`${dateStr}T${timeStr}`);

  // If checkOutDateTime is before checkInTime, it means we crossed midnight
  if (checkOutDateTime < checkInTime) {
      // This is handled correctly by the fact that dateStr will be the next day
  }

  const diffMs = checkOutDateTime - checkInTime;
  const hours = Math.max(0, diffMs / 1000 / 3600);

  await record.update({
    checkOut: timeStr,
    hoursWorked: hours.toFixed(2),
    overtimeHours: Math.max(0, hours - 8).toFixed(2),
  });

  res.json({ success: true, data: record });
}

async function myAttendance(req, res) {
  const employeeId = req.user.employeeId;
  const { month, year } = req.query;
  const where = { employeeId };

  if (month && year) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    where.date = { [Op.between]: [start, end] };
  }

  const records = await Attendance.findAll({ where, order: [['date', 'DESC'], ['createdAt', 'DESC']] });
  res.json({ success: true, data: records });
}

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

async function teamAttendanceToday(req, res) {
  const { dateStr } = getISTData();
  const reports = await Employee.findAll({ where: { managerId: req.params.managerId }, attributes: ['id'] });
  const ids = reports.map((r) => r.id);

  const records = await Attendance.findAll({
    where: { employeeId: { [Op.in]: ids }, date: dateStr },
    include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'employeeCode'] }],
  });

  res.json({ success: true, data: records });
}

async function statsToday(req, res) {
  const { dateStr } = getISTData();
  const counts = await Attendance.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { date: dateStr },
    group: ['status'],
    raw: true,
  });
  const totalEmployees = await Employee.count({ where: { employmentStatus: 'active' } });

  res.json({
    success: true,
    data: {
      date: dateStr,
      totalEmployees,
      breakdown: counts.map((c) => ({ status: c.status, count: Number(c.count) })),
    },
  });
}

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
