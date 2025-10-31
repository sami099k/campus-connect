const { Message, Group, User } = require('../models');

// Send a message to a group
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Message content required' });
    // Optionally: check membership
    const msg = await Message.create({ sender: req.user.id, group: groupId, content });
    return res.status(201).json({ success: true, message: msg });
  } catch (e) {
    console.error('sendGroupMessage error:', e);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

// Fetch messages for a group
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name avatarUrl branch className section year')
      .sort({ createdAt: 1 })
      .limit(200);
    return res.json({ success: true, messages });
  } catch (e) {
    console.error('getGroupMessages error:', e);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const { FriendRequest } = require('../models');
// Send a direct message (only if friends)
exports.sendDirectMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Message content required' });
    if (userId === req.user.id) return res.status(400).json({ error: 'Cannot message yourself' });
    // Only allow if users are friends (accepted request)
    const isFriend = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: userId, status: 'accepted' },
        { sender: userId, receiver: req.user.id, status: 'accepted' },
      ],
    });
    if (!isFriend) return res.status(403).json({ error: 'You can only message your friends.' });
    const msg = await Message.create({ sender: req.user.id, recipient: userId, content });
    return res.status(201).json({ success: true, message: msg });
  } catch (e) {
    console.error('sendDirectMessage error:', e);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

// Fetch direct messages between two users
exports.getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;
    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: userId },
        { sender: userId, recipient: myId },
      ],
    })
      .populate('sender', 'name avatarUrl branch className section year')
      .sort({ createdAt: 1 })
      .limit(200);
    return res.json({ success: true, messages });
  } catch (e) {
    console.error('getDirectMessages error:', e);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
