const mongoose = require('mongoose');
const { Schema } = mongoose;

const LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  quickPost: { type: Schema.Types.ObjectId, ref: 'QuickPost' },
  comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
}, { timestamps: true });

LikeSchema.index({ user: 1, post: 1 }, { unique: true, partialFilterExpression: { post: { $type: 'objectId' } } });
LikeSchema.index({ user: 1, quickPost: 1 }, { unique: true, partialFilterExpression: { quickPost: { $type: 'objectId' } } });
LikeSchema.index({ user: 1, comment: 1 }, { unique: true, partialFilterExpression: { comment: { $type: 'objectId' } } });

module.exports = mongoose.model('Like', LikeSchema);
