const mongoose = require('mongoose');
const { Schema } = mongoose;

const FriendRequestSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
}, { timestamps: true });

FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
FriendRequestSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);
