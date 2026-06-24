const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/profile-picture/:employeeId', ctrl.upload.single('file'), ctrl.uploadProfilePicture);
router.post('/document/:employeeId', authorize('super_admin', 'hr'), ctrl.upload.single('file'), ctrl.uploadDocument);
router.get('/document/employee/:employeeId', ctrl.listDocuments);
router.delete('/document/:id', ctrl.deleteDocument);

module.exports = router;
