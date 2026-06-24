const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/check-in', ctrl.checkIn);
router.post('/check-out', ctrl.checkOut);
router.get('/me', ctrl.myAttendance);
router.get('/employee/:employeeId', authorize('super_admin', 'hr', 'manager'), ctrl.employeeAttendance);
router.get('/team/:managerId', authorize('super_admin', 'hr', 'manager'), ctrl.teamAttendanceToday);
router.get('/stats/today', ctrl.statsToday);
router.get('/stats/trends', ctrl.attendanceTrends);

module.exports = router;
