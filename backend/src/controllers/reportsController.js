const { Op } = require('sequelize');
const { sequelize, Employee, Department, Attendance, Leave, Payroll } = require('../models');

// GET /api/reports/attendance?month=&year=
async function attendanceReport(req, res) {
  const { month, year } = req.query;
  const where = {};
  if (month && year) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    where.date = { [Op.between]: [start, end] };
  }

  const summary = await Attendance.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where,
    group: ['status'],
    raw: true,
  });

  res.json({ success: true, data: summary });
}

// GET /api/reports/payroll?year=
async function payrollReport(req, res) {
  const { year } = req.query;
  const where = year ? { year: Number(year) } : {};

  const summary = await Payroll.findAll({
    attributes: [
      'month',
      [sequelize.fn('SUM', sequelize.col('netPay')), 'totalNetPay'],
      [sequelize.fn('SUM', sequelize.col('tax')), 'totalTax'],
      [sequelize.fn('SUM', sequelize.col('bonus')), 'totalBonus'],
    ],
    where,
    group: ['month'],
    order: [['month', 'ASC']],
    raw: true,
  });

  res.json({ success: true, data: summary });
}

// GET /api/reports/leave?year=
async function leaveReport(req, res) {
  const { year } = req.query;
  const where = year ? { startDate: { [Op.gte]: `${year}-01-01`, [Op.lte]: `${year}-12-31` } } : {};

  const summary = await Leave.findAll({
    attributes: ['leaveType', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where,
    group: ['leaveType', 'status'],
    raw: true,
  });

  res.json({ success: true, data: summary });
}

// GET /api/reports/departments
async function departmentReport(req, res) {
  const departments = await Department.findAll({ raw: true });

  const data = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await Employee.count({ where: { departmentId: dept.id, employmentStatus: 'active' } });
      const payrollTotal = await Payroll.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('Payroll.netPay')), 'total']],
        include: [{ model: Employee, as: 'employee', attributes: [], where: { departmentId: dept.id } }],
        raw: true,
      });
      return {
        department: dept.name,
        employeeCount,
        monthlyPayrollCost: Number(payrollTotal?.total || 0),
      };
    })
  );

  res.json({ success: true, data });
}

// GET /api/reports/employees  -> headcount by designation / employment type / status
async function employeeReport(req, res) {
  const byStatus = await Employee.findAll({
    attributes: ['employmentStatus', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['employmentStatus'],
    raw: true,
  });
  const byType = await Employee.findAll({
    attributes: ['employmentType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['employmentType'],
    raw: true,
  });

  res.json({ success: true, data: { byStatus, byType } });
}

module.exports = { attendanceReport, payrollReport, leaveReport, departmentReport, employeeReport };
