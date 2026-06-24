const { Department, Employee } = require('../models');
const { sequelize } = require('../models');

// GET /api/departments
async function listDepartments(req, res) {
  const departments = await Department.findAll({
    include: [{ model: Employee, as: 'head', attributes: ['id', 'firstName', 'lastName', 'employeeCode'] }],
    order: [['name', 'ASC']],
  });

  // Attach live headcount per department
  const counts = await Employee.findAll({
    attributes: ['departmentId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { employmentStatus: 'active' },
    group: ['departmentId'],
    raw: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.departmentId, Number(c.count)]));

  const data = departments.map((d) => ({ ...d.toJSON(), employeeCount: countMap[d.id] || 0 }));
  res.json({ success: true, data });
}

// GET /api/departments/:id
async function getDepartment(req, res) {
  const department = await Department.findByPk(req.params.id, {
    include: [{ model: Employee, as: 'head', attributes: ['id', 'firstName', 'lastName'] }],
  });
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: department });
}

// POST /api/departments
async function createDepartment(req, res) {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
}

// PUT /api/departments/:id
async function updateDepartment(req, res) {
  const department = await Department.findByPk(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  await department.update(req.body);
  res.json({ success: true, data: department });
}

// DELETE /api/departments/:id
async function deleteDepartment(req, res) {
  const department = await Department.findByPk(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  await department.destroy();
  res.json({ success: true, message: 'Department deleted' });
}

module.exports = { listDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
