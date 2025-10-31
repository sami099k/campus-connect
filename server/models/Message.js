const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // If group, group is set; if DM, recipient is set
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  recipient: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // Optionally: attachments, read status, etc.
});

module.exports = mongoose.model('Message', MessageSchema);
