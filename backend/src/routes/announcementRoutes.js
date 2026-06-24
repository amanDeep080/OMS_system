const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.listAnnouncements);
router.get('/:id', ctrl.getAnnouncement);
router.post('/', authorize('super_admin', 'hr'), ctrl.createAnnouncement);
router.put('/:id', authorize('super_admin', 'hr'), ctrl.updateAnnouncement);
router.delete('/:id', authorize('super_admin', 'hr'), ctrl.deleteAnnouncement);

module.exports = router;
