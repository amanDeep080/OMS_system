const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/socialController');
const { authenticate } = require('../middleware/auth');
const audit = require('../middleware/audit');

router.use(authenticate);

router.get('/posts', ctrl.listPosts);
router.post('/posts', audit('Social', 'Created Post'), ctrl.createPost);
router.get('/recognitions', ctrl.listRecognitions);
router.post('/recognitions', audit('Engagement', 'Gave Kudos'), ctrl.createKudos);

module.exports = router;
