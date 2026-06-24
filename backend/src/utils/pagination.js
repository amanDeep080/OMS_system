function paginate(req, defaultLimit = 20) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || defaultLimit, 5000);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginatedResponse(res, { rows, count }, page, limit) {
  return res.json({
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

module.exports = { paginate, paginatedResponse };
