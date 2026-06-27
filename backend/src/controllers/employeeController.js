const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { Employee, Department, User } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/employees
async function listEmployees(req, res) {
  const { page, limit, offset } = paginate(req, 20);
  const { search, departmentId, status, designation } = req.query;

  const where = {};
  if (status) where.employmentStatus = status;
  if (departmentId) where.departmentId = departmentId;
  if (designation) where.designation = { [Op.iLike]: `%${designation}%` };
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { employeeCode: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const result = await Employee.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
      { model: Employee, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'employeeCode'] },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  paginatedResponse(res, result, page, limit);
}

// GET /api/employees/:id
async function getEmployee(req, res) {
  const employee = await Employee.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department' },
      { model: Employee, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'employeeCode', 'designation'] },
      { model: Employee, as: 'directReports', attributes: ['id', 'firstName', 'lastName', 'employeeCode', 'designation'] },
    ],
  });

  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  // Employees can only view their own salary/bank details; HR/Admin/Manager-of-record see full record
  const isSelf = req.user.employeeId === employee.id;
  const canSeeSensitive = ['super_admin', 'hr'].includes(req.user.role) || isSelf;

  const data = employee.toJSON();
  if (!canSeeSensitive) {
    delete data.annualSalary;
    delete data.bankDetails;
  }

  res.json({ success: true, data });
}

// POST /api/employees  (HR / Super Admin only)
async function createEmployee(req, res) {
  try {
    const {
      firstName, lastName, email, phone, gender, dateOfBirth,
      departmentId, designation, managerId, employmentType,
      joiningDate, annualSalary, address, emergencyContact, role, password
    } = req.body;

    // Check if email already exists
    const existingEmail = await Employee.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Generate robust employee code
    // We find the highest numerical suffix among all existing EMP codes
    const allCodes = await Employee.findAll({
      attributes: ['employeeCode'],
      where: { employeeCode: { [Op.like]: 'EMP%' } },
      raw: true
    });

    let maxNum = 0;
    allCodes.forEach(e => {
      const num = parseInt(e.employeeCode.replace('EMP', ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    });
    const employeeCode = `EMP${String(maxNum + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth: dateOfBirth || null,
      departmentId: departmentId || null,
      designation,
      managerId: managerId || null,
      employmentType: employmentType || 'full_time',
      joiningDate: joiningDate || new Date(),
      annualSalary: parseFloat(annualSalary) || 0,
      address: address || {},
      emergencyContact: emergencyContact || {},
      employmentStatus: 'active',
    });

    // Provision a login account
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const initialPassword = password || `Welcome@${new Date().getFullYear()}`;
    const passwordHash = await bcrypt.hash(initialPassword, saltRounds);

    await User.create({
      employeeId: employee.id,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'employee',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: employee,
      message: `Employee created successfully.`
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create employee' });
  }
}

// PUT /api/employees/:id
async function updateEmployee(req, res) {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  const isSelf = req.user.employeeId === employee.id;
  const isPrivileged = ['super_admin', 'hr'].includes(req.user.role);

  // Regular employees may only update their own contact/address/emergency info
  const allowedFieldsForSelf = ['phone', 'address', 'emergencyContact', 'profilePicture'];
  const updates = isPrivileged
    ? req.body
    : Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFieldsForSelf.includes(key)));

  if (!isPrivileged && !isSelf) {
    return res.status(403).json({ success: false, message: 'You do not have permission to update this record' });
  }

  await employee.update(updates);
  res.json({ success: true, data: employee });
}

// DELETE /api/employees/:id (soft delete -> terminated)
async function deactivateEmployee(req, res) {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  await employee.update({ employmentStatus: 'terminated', exitDate: new Date() });
  await User.update({ isActive: false }, { where: { employeeId: employee.id } });

  res.json({ success: true, message: 'Employee has been deactivated' });
}

// GET /api/employees/:id/team  (direct reports, for managers)
async function getDirectReports(req, res) {
  const reports = await Employee.findAll({
    where: { managerId: req.params.id },
    include: [{ model: Department, as: 'department', attributes: ['name'] }],
    order: [['firstName', 'ASC']],
  });
  res.json({ success: true, data: reports });
}

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  getDirectReports,
};
