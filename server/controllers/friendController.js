const { FriendRequest, User } = require('../models');

/**
 * Send friend request
 * @route POST /api/friends/request
 * @body { receiverId }
 */
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required.' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send request to yourself.' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if request already exists
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'You are already friends.' });
      }
      return res.status(400).json({ error: 'Friend request already sent.' });
    }

    // Create request
    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      request,
    });
  } catch (err) {
    console.error('Send friend request error:', err);
    return res.status(500).json({ error: 'Failed to send friend request.' });
  }
};

/**
 * Accept friend request
 * @route PUT /api/friends/accept/:requestId
 */
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id.toString();

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed.' });
    }

    request.status = 'accepted';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Friend request accepted',
      request,
    });
  } catch (err) {
    console.error('Accept friend request error:', err);
    return res.status(500).json({ error: 'Failed to accept friend request.' });
  }
};

/**
 * Reject friend request
 * @route PUT /api/friends/reject/:requestId
 */
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id.toString();

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed.' });
    }

    request.status = 'rejected';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Friend request rejected',
      request,
    });
  } catch (err) {
    console.error('Reject friend request error:', err);
    return res.status(500).json({ error: 'Failed to reject friend request.' });
  }
};

/**
 * Get pending friend requests (received)
 * @route GET /api/friends/requests/pending
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    const requests = await FriendRequest.find({
      receiver: userId,
      status: 'pending',
    })
      .populate('sender', 'name collegeEmail branch year className section avatarUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error('Get pending requests error:', err);
    return res.status(500).json({ error: 'Failed to fetch pending requests.' });
  }
};

/**
 * Get all friends
 * @route GET /api/friends
 */
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    })
      .populate('sender', 'name collegeEmail branch year className section avatarUrl')
      .populate('receiver', 'name collegeEmail branch year className section avatarUrl');

    // Extract friends (not self)
    const friends = friendships.map((f) => (
      f.sender._id.toString() === userId ? f.receiver : f.sender
    ));

    return res.status(200).json({
      success: true,
      friends,
    });
  } catch (err) {
    console.error('Get friends error:', err);
    return res.status(500).json({ error: 'Failed to fetch friends.' });
  }
};

/**
 * Search users by name or email
 * @route GET /api/friends/search?q=query
 */
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters.' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { collegeEmail: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user.id }, // Exclude self
    })
      .select('name collegeEmail branch year className section avatarUrl')
      .limit(20);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error('Search users error:', err);
    return res.status(500).json({ error: 'Failed to search users.' });
  }
};
