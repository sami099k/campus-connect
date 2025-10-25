const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createPost,
  getFeed,
  getMyPosts,
  getPost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  uploadPostImagesMiddleware,
} = require('../controllers/postController');

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/posts
router.post('/', uploadPostImagesMiddleware, createPost);

// @route   GET /api/posts/feed
router.get('/feed', getFeed);

// @route   GET /api/posts/me
router.get('/me', getMyPosts);

// @route   GET /api/posts/:id
router.get('/:id', getPost);

// @route   DELETE /api/posts/:id
router.delete('/:id', deletePost);

// @route   POST /api/posts/:id/like
router.post('/:id/like', toggleLike);

// @route   GET /api/posts/:id/comments
router.get('/:id/comments', getComments);

// @route   POST /api/posts/:id/comments
router.post('/:id/comments', addComment);

module.exports = router;
