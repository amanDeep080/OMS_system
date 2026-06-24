const { Op } = require('sequelize');
const { Leave, Employee, Notification } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

const { sendNotification, notifyAdmins } = require('../utils/notifications');

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

// POST /api/leaves
async function applyLeave(req, res) {
  try {
    const employeeId = req.user.employeeId;
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays: daysBetween(startDate, endDate),
      reason,
      status: 'pending',
    });

    const employee = await Employee.findByPk(employeeId);
    await notifyAdmins(req.app, {
      title: 'New Leave Request',
      message: `${employee.firstName} ${employee.lastName} applied for ${leaveType.replace('_', ' ')} for ${leave.totalDays} days.`,
      type: 'leave',
      link: `/leaves`
    });

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/leaves/me
async function myLeaves(req, res) {
  const leaves = await Leave.findAll({
    where: { employeeId: req.user.employeeId },
    order: [['appliedOn', 'DESC']],
  });
  res.json({ success: true, data: leaves });
}

// GET /api/leaves  (HR/Admin - all, Manager - team) with filters
async function listLeaves(req, res) {
  const { page, limit, offset } = paginate(req, 20);
  const { status, leaveType, employeeId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (leaveType) where.leaveType = leaveType;
  if (employeeId) where.employeeId = employeeId;

  // Managers only see their direct reports' leave requests
  if (req.user.role === 'manager') {
    const reports = await Employee.findAll({ where: { managerId: req.user.employeeId }, attributes: ['id'] });
    where.employeeId = { [Op.in]: reports.map((r) => r.id) };
  }

  const result = await Leave.findAndCountAll({
    where,
    include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'employeeCode'] }],
    limit,
    offset,
    order: [['appliedOn', 'DESC']],
  });

  paginatedResponse(res, result, page, limit);
}

// PATCH /api/leaves/:id/decision  { status: 'approved' | 'rejected', decisionNote }
async function decideLeave(req, res) {
  try {
    const { status, decisionNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const leave = await Leave.findByPk(req.params.id, {
      include: [{ model: Employee, as: 'employee', include: ['account'] }]
    });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    await leave.update({
      status,
      decisionNote,
      decidedOn: new Date(),
      approvedById: req.user.employeeId,
    });

    if (leave.employee && leave.employee.account) {
      await sendNotification(req.app, leave.employee.account.id, {
        title: `Leave request ${status}`,
        message: `Your ${leave.leaveType.replace('_', ' ')} request for ${leave.totalDays} day(s) was ${status}.`,
        type: 'leave',
        link: '/leaves'
      });
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/leaves/:id/cancel
async function cancelLeave(req, res) {
  const leave = await Leave.findByPk(req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
  if (leave.employeeId !== req.user.employeeId) {
    return res.status(403).json({ success: false, message: 'You can only cancel your own leave requests' });
  }
  if (leave.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
  }

  await leave.update({ status: 'cancelled' });
  res.json({ success: true, data: leave });
}

// GET /api/leaves/balance/:employeeId
async function leaveBalance(req, res) {
  const employeeId = req.params.employeeId;
  const year = new Date().getFullYear();

  const annualAllowance = { sick_leave: 12, casual_leave: 12, earned_leave: 15 };

  const used = await Leave.findAll({
    where: {
      employeeId,
      status: 'approved',
      startDate: { [Op.gte]: `${year}-01-01` },
    },
    attributes: ['leaveType', 'totalDays'],
    raw: true,
  });

  const usedByType = used.reduce((acc, l) => {
    acc[l.leaveType] = (acc[l.leaveType] || 0) + Number(l.totalDays);
    return acc;
  }, {});

  const balance = Object.entries(annualAllowance).map(([type, allowance]) => ({
    leaveType: type,
    allowance,
    used: usedByType[type] || 0,
    remaining: allowance - (usedByType[type] || 0),
  }));

  res.json({ success: true, data: balance });
}

module.exports = { applyLeave, myLeaves, listLeaves, decideLeave, cancelLeave, leaveBalance };
