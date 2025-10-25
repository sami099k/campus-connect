const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['like', 'comment', 'reply', 'mention', 'group-invite', 'system'], required: true },
  data: { type: Schema.Types.Mixed },
  readAt: { type: Date },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
