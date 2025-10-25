const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/admin')
const { createGroup } = require('../controllers/groupController')

router.use(authMiddleware)
router.post('/', requireAdmin, createGroup)

module.exports = router
