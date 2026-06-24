const { Notification } = require('../models');

// GET /api/notifications
async function listNotifications(req, res) {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  res.json({ success: true, data: notifications });
}

// PATCH /api/notifications/:id/read
async function markRead(req, res) {
  await Notification.update({ isRead: true }, { where: { id: req.params.id, userId: req.user.id } });
  res.json({ success: true });
}

// PATCH /api/notifications/read-all
async function markAllRead(req, res) {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  res.json({ success: true });
}

module.exports = { listNotifications, markRead, markAllRead };
