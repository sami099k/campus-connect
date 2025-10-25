const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
  searchUsers,
} = require('../controllers/friendController');

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/friends/request
router.post('/request', sendFriendRequest);

// @route   PUT /api/friends/accept/:requestId
router.put('/accept/:requestId', acceptFriendRequest);

// @route   PUT /api/friends/reject/:requestId
router.put('/reject/:requestId', rejectFriendRequest);

// @route   GET /api/friends/requests/pending
router.get('/requests/pending', getPendingRequests);

// @route   GET /api/friends
router.get('/', getFriends);

// @route   GET /api/friends/search
router.get('/search', searchUsers);

module.exports = router;
