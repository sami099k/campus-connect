const mongoose = require('mongoose');
const { Schema } = mongoose;

const MembershipSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
}, { timestamps: true });

MembershipSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Membership', MembershipSchema);
