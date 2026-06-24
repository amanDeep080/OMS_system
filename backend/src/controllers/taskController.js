const { Task, Employee } = require('../models');
const { Op } = require('sequelize');

async function listTasks(req, res) {
  try {
    const { status, priority, assignedToId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    // If not admin/hr, only show tasks assigned to or created by the user
    if (!['super_admin', 'hr'].includes(req.user.role)) {
      where[Op.or] = [
        { assignedToId: req.user.employeeId },
        { assignedById: req.user.employeeId }
      ];
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Employee, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
        { model: Employee, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createTask(req, res) {
  try {
    const { title, description, priority, assignedToId, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      assignedToId,
      assignedById: req.user.employeeId,
      dueDate,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Permission check: assignee can update status, creator/admin can update anything
    const isAssignee = task.assignedToId === req.user.employeeId;
    const isCreator = task.assignedById === req.user.employeeId;
    const isPrivileged = ['super_admin', 'hr'].includes(req.user.role);

    if (!isAssignee && !isCreator && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updates = req.body;
    if (updates.status === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date();
    }

    await task.update(updates);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.assignedById !== req.user.employeeId && !['super_admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await task.destroy();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
