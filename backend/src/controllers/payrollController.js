const { Op } = require('sequelize');
const { sequelize, Payroll, Employee, Department } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/payroll/me
async function myPayroll(req, res) {
  const records = await Payroll.findAll({
    where: { employeeId: req.user.employeeId },
    order: [['year', 'DESC'], ['month', 'DESC']],
  });
  res.json({ success: true, data: records });
}

// GET /api/payroll/:id  (single payslip)
async function getPayslip(req, res) {
  const record = await Payroll.findByPk(req.params.id, {
    include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'employeeCode', 'designation'] }],
  });
  if (!record) return res.status(404).json({ success: false, message: 'Payslip not found' });

  const isSelf = record.employeeId === req.user.employeeId;
  if (!isSelf && !['super_admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to view this payslip' });
  }

  res.json({ success: true, data: record });
}

// GET /api/payroll/employee/:employeeId
async function employeePayroll(req, res) {
  const { page, limit, offset } = paginate(req, 12);
  const result = await Payroll.findAndCountAll({
    where: { employeeId: req.params.employeeId },
    limit,
    offset,
    order: [['year', 'DESC'], ['month', 'DESC']],
  });
  paginatedResponse(res, result, page, limit);
}

// GET /api/payroll/stats/monthly-cost?months=12
async function monthlyCost(req, res) {
  const months = Number(req.query.months) || 12;
  const records = await Payroll.findAll({
    attributes: [
      'month', 'year',
      [sequelize.fn('SUM', sequelize.col('netPay')), 'totalNetPay'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'employeeCount'],
    ],
    group: ['month', 'year'],
    order: [['year', 'DESC'], ['month', 'DESC']],
    limit: months,
    raw: true,
  });
  res.json({ success: true, data: records.reverse() });
}

// GET /api/payroll/stats/department-distribution?month=&year=
async function departmentDistribution(req, res) {
  const { month, year } = req.query;
  const where = {};
  if (month && year) {
    where.month = Number(month);
    where.year = Number(year);
  }

  const records = await Payroll.findAll({
    attributes: [[sequelize.fn('SUM', sequelize.col('Payroll.netPay')), 'totalNetPay']],
    include: [{ model: Employee, as: 'employee', attributes: [], include: [{ model: Department, as: 'department', attributes: ['name'] }] }],
    where,
    group: ['employee.department.id', 'employee.department.name'],
    raw: true,
  });

  res.json({ success: true, data: records });
}

// GET /api/payroll/stats/salary-trends
async function salaryTrends(req, res) {
  const records = await Payroll.findAll({
    attributes: [
      'month', 'year',
      [sequelize.fn('AVG', sequelize.col('netPay')), 'avgNetPay'],
      [sequelize.fn('SUM', sequelize.col('bonus')), 'totalBonus'],
    ],
    group: ['month', 'year'],
    order: [['year', 'ASC'], ['month', 'ASC']],
    raw: true,
  });
  res.json({ success: true, data: records });
}

// POST /api/payroll/generate  { month, year }  -> HR/Admin runs monthly payroll for all active employees
async function generatePayroll(req, res) {
  const { month, year } = req.body;
  const employees = await Employee.findAll({ where: { employmentStatus: 'active' } });

  let created = 0;
  for (const emp of employees) {
    const exists = await Payroll.findOne({ where: { employeeId: emp.id, month, year } });
    if (exists) continue;

    const basic = Number(emp.annualSalary) / 12;
    const hra = basic * 0.2;
    const otherAllowances = basic * 0.1;
    const tax = basic * 0.1;
    const providentFund = basic * 0.12;
    const gross = basic + hra + otherAllowances;
    const net = gross - tax - providentFund;

    await Payroll.create({
      employeeId: emp.id,
      payslipNumber: `PS-${year}${String(month).padStart(2, '0')}-${emp.employeeCode}`,
      month,
      year,
      basic: basic.toFixed(2),
      hra: hra.toFixed(2),
      otherAllowances: otherAllowances.toFixed(2),
      tax: tax.toFixed(2),
      providentFund: providentFund.toFixed(2),
      grossPay: gross.toFixed(2),
      netPay: net.toFixed(2),
      status: 'paid',
      paidOn: new Date(),
    });
    created += 1;
  }

  res.status(201).json({ success: true, message: `Payroll generated for ${created} employee(s)` });
}

module.exports = {
  myPayroll,
  getPayslip,
  employeePayroll,
  monthlyCost,
  departmentDistribution,
  salaryTrends,
  generatePayroll,
};
