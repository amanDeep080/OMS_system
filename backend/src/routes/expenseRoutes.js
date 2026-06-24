const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');
const audit = require('../middleware/audit');

router.use(authenticate);

router.get('/', ctrl.listExpenses);
router.post('/', audit('Expenses', 'Submitted Reimbursement'), ctrl.createExpense);
router.patch('/:id/approve', authorize('super_admin', 'hr', 'manager'), audit('Expenses', 'Processed Reimbursement'), ctrl.approveExpense);

module.exports = router;
