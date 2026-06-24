const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/performanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/me', ctrl.myReviews);
router.get('/', authorize('super_admin', 'hr', 'manager'), ctrl.listReviews);
router.get('/employee/:employeeId', ctrl.employeeReviews);
router.post('/', authorize('super_admin', 'hr', 'manager'), ctrl.createReview);
router.put('/:id', authorize('super_admin', 'hr', 'manager'), ctrl.updateReview);

module.exports = router;
