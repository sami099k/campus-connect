const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { getMe, updateMe, uploadAvatar, uploadAvatarMiddleware } = require('../controllers/userController')

router.use(authMiddleware)

router.get('/me', getMe)
router.put('/me', updateMe)
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar)

module.exports = router
