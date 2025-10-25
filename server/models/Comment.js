const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  quickPost: { type: Schema.Types.ObjectId, ref: 'QuickPost' },
  content: { type: String, required: true, maxlength: 1000 },
  parent: { type: Schema.Types.ObjectId, ref: 'Comment' }, // for threads
  likesCount: { type: Number, default: 0 },
}, { timestamps: true });

CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ quickPost: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
