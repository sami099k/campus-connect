exports.requireAdmin = (req, res, next) => {
  // Check if user has isAdmin flag set to true
  if (req.user?.isAdmin === true) {
    return next()
  }
  
  // Fallback: Check admin emails list from environment
  const list = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  const email = (req.user?.email || '').toLowerCase()
  if (email && list.includes(email)) {
    return next()
  }
  
  return res.status(403).json({ error: 'Admin access required' })
}
