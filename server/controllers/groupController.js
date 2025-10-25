const { Group, Membership } = require('../models')

exports.createGroup = async (req, res) => {
  try {
    const { type = 'cohort', name, branch, className, section, year, description } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })
    const group = await Group.create({ type, name, branch, className, section, year, description, createdBy: req.user.id })
    return res.status(201).json({ success: true, message: 'Group created', group })
  } catch (e) {
    console.error('createGroup error:', e)
    return res.status(500).json({ error: 'Failed to create group' })
  }
}

// Ensure branch-level group exists for a user
exports.ensureBranchGroup = async (user) => {
  const query = { type: 'cohort', branch: user.branch, className: null, section: null, year: null }
  let group = await Group.findOne(query)
  if (!group) {
    group = await Group.create({ 
      ...query, 
      name: `${user.branch} Branch`, 
      description: `All students from ${user.branch} department`,
      isAutoAssigned: true 
    })
  }
  await Membership.updateOne({ user: user._id, group: group._id }, { $setOnInsert: { role: 'member' } }, { upsert: true })
  return group
}

// Ensure class-level group exists for a user (e.g., BTech CSE)
exports.ensureClassGroup = async (user) => {
  const query = { type: 'cohort', branch: user.branch, className: user.className, section: null, year: null }
  let group = await Group.findOne(query)
  if (!group) {
    group = await Group.create({ 
      ...query, 
      name: `${user.className} ${user.branch}`, 
      description: `All ${user.className} students from ${user.branch} department`,
      isAutoAssigned: true 
    })
  }
  await Membership.updateOne({ user: user._id, group: group._id }, { $setOnInsert: { role: 'member' } }, { upsert: true })
  return group
}

// Ensure year-level group exists for a user (e.g., BTech CSE Year 2)
exports.ensureYearGroup = async (user) => {
  const query = { type: 'cohort', branch: user.branch, className: user.className, section: null, year: user.year }
  let group = await Group.findOne(query)
  if (!group) {
    group = await Group.create({ 
      ...query, 
      name: `${user.className} ${user.branch} Year ${user.year}`, 
      description: `${user.className} ${user.branch} students in Year ${user.year}`,
      isAutoAssigned: true 
    })
  }
  await Membership.updateOne({ user: user._id, group: group._id }, { $setOnInsert: { role: 'member' } }, { upsert: true })
  return group
}

// Ensure section-level group exists for a user (most specific)
exports.ensureCohortForUser = async (user) => {
  const query = { type: 'cohort', branch: user.branch, className: user.className, section: user.section, year: user.year }
  let group = await Group.findOne(query)
  if (!group) {
    group = await Group.create({ 
      ...query, 
      name: `${user.branch} ${user.className} Y${user.year} Sec-${user.section}`, 
      description: `${user.className} ${user.branch} Year ${user.year} Section ${user.section}`,
      isAutoAssigned: true 
    })
  }
  await Membership.updateOne({ user: user._id, group: group._id }, { $setOnInsert: { role: 'member' } }, { upsert: true })
  return group
}

// Assign user to all relevant groups (branch, class, year, section)
exports.assignUserToAllGroups = async (user) => {
  try {
    await Promise.all([
      exports.ensureBranchGroup(user),
      exports.ensureClassGroup(user),
      exports.ensureYearGroup(user),
      exports.ensureCohortForUser(user),
    ])
  } catch (error) {
    console.error('assignUserToAllGroups error:', error)
    throw error
  }
}
