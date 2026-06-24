const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('super_admin', 'hr', 'manager'));

router.get('/attendance', ctrl.attendanceReport);
router.get('/payroll', ctrl.payrollReport);
router.get('/leave', ctrl.leaveReport);
router.get('/departments', ctrl.departmentReport);
router.get('/employees', ctrl.employeeReport);

module.exports = router;
