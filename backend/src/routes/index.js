const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/employees', require('./employeeRoutes'));
router.use('/departments', require('./departmentRoutes'));
router.use('/attendance', require('./attendanceRoutes'));
router.use('/leaves', require('./leaveRoutes'));
router.use('/payroll', require('./payrollRoutes'));
router.use('/performance', require('./performanceRoutes'));
router.use('/announcements', require('./announcementRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/reports', require('./reportsRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/uploads', require('./uploadRoutes'));
router.use('/tasks', require('./taskRoutes'));
router.use('/assets', require('./assetRoutes'));
router.use('/expenses', require('./expenseRoutes'));
router.use('/audit-logs', require('./auditRoutes'));
router.use('/social', require('./socialRoutes'));

module.exports = router;
