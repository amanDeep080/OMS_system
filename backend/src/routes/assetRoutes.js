const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/assetController');
const { authenticate, authorize } = require('../middleware/auth');
const audit = require('../middleware/audit');

router.use(authenticate);
router.use(authorize('super_admin', 'hr'));

router.get('/', ctrl.listAssets);
router.post('/', audit('Assets', 'Added New Asset'), ctrl.createAsset);
router.patch('/:id/assign', audit('Assets', 'Assigned Asset to Employee'), ctrl.assignAsset);

module.exports = router;
