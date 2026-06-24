const express = require('express');
const router = express.Router();
const { AuditLog, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
