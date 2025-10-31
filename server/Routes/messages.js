const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/messageController');

router.use(authMiddleware);

// Group chat
router.post('/group/:groupId', ctrl.sendGroupMessage);
router.get('/group/:groupId', ctrl.getGroupMessages);

// Direct (one-to-one) chat
router.post('/dm/:userId', ctrl.sendDirectMessage);
router.get('/dm/:userId', ctrl.getDirectMessages);

module.exports = router;
