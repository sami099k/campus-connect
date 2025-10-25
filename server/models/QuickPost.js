const mongoose = require('mongoose');
const { Schema } = mongoose;

// QuickPost: short updates or questions (like tweets)
const QuickPostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true, maxlength: 280 },
  visibility: { type: String, enum: ['public', 'group', 'branch', 'class', 'year', 'section'], default: 'group' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

QuickPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QuickPost', QuickPostSchema);
