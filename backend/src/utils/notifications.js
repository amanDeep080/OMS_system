const { Notification, User } = require('../models');

async function sendNotification(app, userId, { title, message, type, link }) {
  try {
    // Save to DB
    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'info',
      link: link || null,
      isRead: false,
    });

    // Send real-time via Socket.io
    const io = app.get('io');
    if (io) {
      io.to(userId).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
}

async function notifyAdmins(app, { title, message, type, link }) {
  try {
    const admins = await User.findAll({ where: { role: ['super_admin', 'hr'] } });
    const notifications = await Promise.all(
      admins.map((admin) => sendNotification(app, admin.id, { title, message, type, link }))
    );
    return notifications;
  } catch (err) {
    console.error('Failed to notify admins:', err);
  }
}

module.exports = { sendNotification, notifyAdmins };
