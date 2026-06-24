const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.listDepartments);
router.get('/:id', ctrl.getDepartment);
router.post('/', authorize('super_admin', 'hr'), ctrl.createDepartment);
router.put('/:id', authorize('super_admin', 'hr'), ctrl.updateDepartment);
router.delete('/:id', authorize('super_admin'), ctrl.deleteDepartment);

module.exports = router;
