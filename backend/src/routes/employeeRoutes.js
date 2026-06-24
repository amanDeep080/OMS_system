const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');
const audit = require('../middleware/audit');

router.use(authenticate);

/**
 * @openapi
 * /employees:
 *   get:
 *     tags: [Employees]
 *     summary: List employees with search, filters and pagination
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, on_leave, terminated, resigned] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated employee directory }
 *   post:
 *     tags: [Employees]
 *     summary: Create a new employee (HR / Super Admin only)
 *     responses:
 *       201: { description: Employee created }
 */
router.get('/', ctrl.listEmployees);
router.post('/', authorize('super_admin', 'hr'), audit('Employees', 'Created New Employee'), ctrl.createEmployee);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get a single employee profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Employee profile }
 *       404: { description: Employee not found }
 *   put:
 *     tags: [Employees]
 *     summary: Update an employee (self may edit limited fields; HR/Admin may edit all)
 *   delete:
 *     tags: [Employees]
 *     summary: Deactivate (soft delete) an employee
 */
router.get('/:id', ctrl.getEmployee);
router.get('/:id/team', ctrl.getDirectReports);
router.put('/:id', audit('Employees', 'Updated Profile'), ctrl.updateEmployee); // internal permission check for self vs privileged
router.delete('/:id', authorize('super_admin', 'hr'), audit('Employees', 'Deactivated Employee'), ctrl.deactivateEmployee);

module.exports = router;
