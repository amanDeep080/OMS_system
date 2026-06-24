const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @openapi
 * /leaves:
 *   post:
 *     tags: [Leaves]
 *     summary: Apply for a leave
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveType: { type: string, enum: [sick_leave, casual_leave, earned_leave, maternity_leave, paternity_leave, unpaid_leave] }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Leave request created }
 *   get:
 *     tags: [Leaves]
 *     summary: List leave requests (HR/Admin see all, Manager sees their team)
 */
router.post('/', ctrl.applyLeave);
router.get('/me', ctrl.myLeaves);
router.get('/', authorize('super_admin', 'hr', 'manager'), ctrl.listLeaves);
router.get('/balance/:employeeId', ctrl.leaveBalance);
router.patch('/:id/decision', authorize('super_admin', 'hr', 'manager'), ctrl.decideLeave);
router.patch('/:id/cancel', ctrl.cancelLeave);

module.exports = router;
