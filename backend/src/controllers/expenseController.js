const { Expense, Employee } = require('../models');

async function listExpenses(req, res) {
  try {
    const where = {};
    if (req.user.role === 'employee') {
      where.employeeId = req.user.employeeId;
    }
    const expenses = await Expense.findAll({
      where,
      include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName'] }]
    });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createExpense(req, res) {
  try {
    const expense = await Expense.create({
      ...req.body,
      employeeId: req.user.employeeId,
      status: 'pending'
    });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function approveExpense(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    await expense.update({
      status,
      notes,
      approvedById: req.user.employeeId
    });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listExpenses, createExpense, approveExpense };
