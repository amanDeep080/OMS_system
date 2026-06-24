const { Op } = require('sequelize');
const { Performance, Employee } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/performance/me
async function myReviews(req, res) {
  const reviews = await Performance.findAll({
    where: { employeeId: req.user.employeeId },
    order: [['year', 'DESC'], ['quarter', 'DESC']],
  });
  res.json({ success: true, data: reviews });
}

// GET /api/performance/employee/:employeeId
async function employeeReviews(req, res) {
  const reviews = await Performance.findAll({
    where: { employeeId: req.params.employeeId },
    order: [['year', 'DESC'], ['quarter', 'DESC']],
  });
  res.json({ success: true, data: reviews });
}

// GET /api/performance  (HR/Admin/Manager - filtered list)
async function listReviews(req, res) {
  const { page, limit, offset } = paginate(req, 20);
  const { quarter, year, minRating } = req.query;
  const where = {};
  if (quarter) where.quarter = quarter;
  if (year) where.year = Number(year);
  if (minRating) where.rating = { [Op.gte]: Number(minRating) };

  if (req.user.role === 'manager') {
    const reports = await Employee.findAll({ where: { managerId: req.user.employeeId }, attributes: ['id'] });
    where.employeeId = { [Op.in]: reports.map((r) => r.id) };
  }

  const result = await Performance.findAndCountAll({
    where,
    include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'employeeCode', 'designation'] }],
    limit,
    offset,
    order: [['year', 'DESC'], ['quarter', 'DESC']],
  });

  paginatedResponse(res, result, page, limit);
}

// POST /api/performance  (Manager/HR creates a review)
async function createReview(req, res) {
  const review = await Performance.create({ ...req.body, reviewerId: req.user.employeeId, reviewDate: new Date() });
  res.status(201).json({ success: true, data: review });
}

// PUT /api/performance/:id
async function updateReview(req, res) {
  const review = await Performance.findByPk(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  await review.update(req.body);
  res.json({ success: true, data: review });
}

module.exports = { myReviews, employeeReviews, listReviews, createReview, updateReview };
