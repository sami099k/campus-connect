const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/admin')
const { createGroup } = require('../controllers/groupController')
const { Group, Membership } = require('../models')


router.use(authMiddleware)
router.post('/', requireAdmin, createGroup)

// Get all groups the user is a member of
router.get('/mine', async (req, res) => {
	try {
		const memberships = await Membership.find({ user: req.user.id }).populate('group');
		const groups = memberships.map(m => m.group);
		res.json({ success: true, groups });
	} catch (e) {
		res.status(500).json({ error: 'Failed to fetch groups' });
	}
});

// Get group by ID
router.get('/:groupId', async (req, res) => {
	try {
		const group = await Group.findById(req.params.groupId);
		if (!group) return res.status(404).json({ error: 'Group not found' });
		res.json({ success: true, group });
	} catch (e) {
		res.status(500).json({ error: 'Failed to fetch group' });
	}
});

module.exports = router
