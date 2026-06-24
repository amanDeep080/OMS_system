const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/me', ctrl.myPayroll);
router.get('/stats/monthly-cost', authorize('super_admin', 'hr'), ctrl.monthlyCost);
router.get('/stats/department-distribution', authorize('super_admin', 'hr'), ctrl.departmentDistribution);
router.get('/stats/salary-trends', authorize('super_admin', 'hr'), ctrl.salaryTrends);
router.get('/employee/:employeeId', authorize('super_admin', 'hr'), ctrl.employeePayroll);
router.get('/:id', ctrl.getPayslip);
router.post('/generate', authorize('super_admin', 'hr'), ctrl.generatePayroll);

module.exports = router;
