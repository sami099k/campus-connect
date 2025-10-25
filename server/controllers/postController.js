const { Post, User, Like, Comment } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'posts')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `post-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new Error('Only image files allowed'), false)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB

exports.uploadPostImagesMiddleware = upload.array('images', 5) // Max 5 images

/**
 * Create a post
 * @route POST /api/posts
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, visibility } = req.body;
    const authorId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    // Handle uploaded images
    const mediaUrls = req.files ? req.files.map(file => `/uploads/posts/${file.filename}`) : [];

    const post = await Post.create({
      author: authorId,
      title: title || '',
      content,
      mediaUrls: mediaUrls,
      tags: tags || [],
      visibility: visibility || 'group',
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name collegeEmail branch year className section avatarUrl'
    );

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (err) {
    console.error('Create post error:', err);
    return res.status(500).json({ error: 'Failed to create post.' });
  }
};

/**
 * Get feed posts
 * @route GET /api/posts/feed
 */
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const posts = await Post.find()
      .populate('author', 'name collegeEmail branch year className section avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Check if user has liked each post
    const postsWithLikes = await Promise.all(posts.map(async (post) => {
      const liked = await Like.findOne({ user: userId, post: post._id });
      return {
        ...post.toObject(),
        isLiked: !!liked,
      };
    }));

    const total = await Post.countDocuments();

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get feed error:', err);
    return res.status(500).json({ error: 'Failed to fetch feed.' });
  }
};

/**
 * Get current user's posts
 * @route GET /api/posts/me
 */
exports.getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const posts = await Post.find({ author: userId })
      .populate('author', 'name collegeEmail branch year className section avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ author: userId });

    // For consistency include isLiked flag
    const postsWithLikes = await Promise.all(posts.map(async (post) => {
      const liked = await Like.findOne({ user: userId, post: post._id });
      return { ...post.toObject(), isLiked: !!liked };
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get my posts error:', err);
    return res.status(500).json({ error: 'Failed to fetch your posts.' });
  }
};

/**
 * Get single post
 * @route GET /api/posts/:id
 */
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id.toString();

    const post = await Post.findById(id).populate(
      'author',
      'name collegeEmail branch year className section avatarUrl'
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Check if user has liked this post
    const liked = await Like.findOne({ user: userId, post: id });

    return res.status(200).json({
      success: true,
      post: {
        ...post.toObject(),
        isLiked: !!liked,
      },
    });
  } catch (err) {
    console.error('Get post error:', err);
    return res.status(500).json({ error: 'Failed to fetch post.' });
  }
};

/**
 * Delete post
 * @route DELETE /api/posts/:id
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post.' });
    }

    await Post.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    console.error('Delete post error:', err);
    return res.status(500).json({ error: 'Failed to delete post.' });
  }
};

/**
 * Toggle like for a post
 * @route POST /api/posts/:id/like
 */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const existing = await Like.findOne({ user: userId, post: id });
    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
      return res.json({ success: true, message: 'Like removed', liked: false });
    }

    await Like.create({ user: userId, post: id });
    await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
    return res.json({ success: true, message: 'Liked', liked: true });
  } catch (err) {
    console.error('Toggle like error:', err);
    return res.status(500).json({ error: 'Failed to toggle like.' });
  }
}

/**
 * Get comments for a post
 * @route GET /api/posts/:id/comments
 */
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ post: id, parent: null })
      .populate('author', 'name collegeEmail avatarUrl')
      .sort({ createdAt: 1 })
      .limit(100);
    return res.json({ success: true, comments });
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json({ error: 'Failed to fetch comments.' });
  }
}

/**
 * Add a comment to a post
 * @route POST /api/posts/:id/comments
 */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required.' });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const comment = await Comment.create({ author: authorId, post: id, content: content.trim() });
    await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });
    const populated = await Comment.findById(comment._id).populate('author', 'name collegeEmail avatarUrl');
    return res.status(201).json({ success: true, message: 'Comment added', comment: populated });
  } catch (err) {
    console.error('Add comment error:', err);
    return res.status(500).json({ error: 'Failed to add comment.' });
  }
}
