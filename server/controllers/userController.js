const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { User } = require('../models')

// Configure multer storage for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'avatars')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.png'
    const name = `${req.user.id}-${Date.now()}${ext}`
    cb(null, name)
  },
})

function fileFilter(req, file, cb) {
  const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.mimetype)
  if (!ok) return cb(new Error('Only PNG, JPG, or WEBP images are allowed'))
  cb(null, true)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }) // 2MB

exports.uploadAvatarMiddleware = upload.single('avatar')

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ success: true, user })
  } catch (e) {
    console.error('getMe error:', e)
    return res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

exports.updateMe = async (req, res) => {
  try {
    const { name, bio, skills, interests, social } = req.body

    const update = {}
    if (name) update.name = name.trim().slice(0, 80)

    // Prepare embedded additional details
    const additional = {}
    if (bio !== undefined) additional.bio = String(bio).slice(0, 280)
    if (skills !== undefined) additional.skills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
      : String(skills).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20)
    if (interests !== undefined) additional.interests = Array.isArray(interests)
      ? interests.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
      : String(interests).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20)
    if (social !== undefined) additional.social = {
      linkedin: social.linkedin || undefined,
      github: social.github || undefined,
      twitter: social.twitter || undefined,
      instagram: social.instagram || undefined,
    }

    if (Object.keys(additional).length) update.additional = additional

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true }
    ).select('-passwordHash')

    return res.json({ success: true, message: 'Profile updated', user })
  } catch (e) {
    console.error('updateMe error:', e)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
}

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })
    const rel = `/uploads/avatars/${req.file.filename}`
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatarUrl: rel } },
      { new: true }
    ).select('-passwordHash')
    return res.json({ success: true, message: 'Avatar updated', avatarUrl: rel, user })
  } catch (e) {
    console.error('uploadAvatar error:', e)
    return res.status(500).json({ error: 'Failed to upload avatar' })
  }
}
