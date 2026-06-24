const { Op } = require('sequelize');
const { Announcement, Employee } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/announcements
async function listAnnouncements(req, res) {
  const { page, limit, offset } = paginate(req, 10);
  const { category } = req.query;
  const where = {};
  if (category) where.category = category;

  const result = await Announcement.findAndCountAll({
    where,
    include: [{ model: Employee, as: 'author', attributes: ['firstName', 'lastName'] }],
    limit,
    offset,
    order: [['isPinned', 'DESC'], ['postedAt', 'DESC']],
  });

  paginatedResponse(res, result, page, limit);
}

// GET /api/announcements/:id
async function getAnnouncement(req, res) {
  const item = await Announcement.findByPk(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Announcement not found' });
  res.json({ success: true, data: item });
}

// POST /api/announcements
async function createAnnouncement(req, res) {
  const item = await Announcement.create({ ...req.body, postedById: req.user.employeeId });
  res.status(201).json({ success: true, data: item });
}

// PUT /api/announcements/:id
async function updateAnnouncement(req, res) {
  const item = await Announcement.findByPk(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Announcement not found' });
  await item.update(req.body);
  res.json({ success: true, data: item });
}

// DELETE /api/announcements/:id
async function deleteAnnouncement(req, res) {
  const item = await Announcement.findByPk(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Announcement not found' });
  await item.destroy();
  res.json({ success: true, message: 'Announcement deleted' });
}

module.exports = { listAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement };
