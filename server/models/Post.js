const mongoose = require('mongoose');
const { Schema } = mongoose;

const VisibilityEnum = ['public', 'group', 'branch', 'class', 'year', 'section'];

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true, maxlength: 150 },
  content: { type: String, required: true, maxlength: 5000 },
  mediaUrls: [{ type: String }],
  tags: [{ type: String, lowercase: true, trim: true }],
  visibility: { type: String, enum: VisibilityEnum, default: 'group' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

PostSchema.index({ createdAt: -1 });
PostSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', PostSchema);
