const mongoose = require('mongoose');
const { Schema } = mongoose;

const OTPSchema = new Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-delete after 5 minutes
});

module.exports = mongoose.model('OTP', OTPSchema);
