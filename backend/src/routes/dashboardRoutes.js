const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * @openapi
 * /dashboard/overview:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get aggregate KPI metrics for the dashboard home screen
 *     responses:
 *       200: { description: Dashboard overview metrics }
 */
router.get('/overview', ctrl.overview);

module.exports = router;
