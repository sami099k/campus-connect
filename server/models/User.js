const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdditionalDetailsSchema = new Schema({
  bio: { type: String, maxlength: 280 },
  skills: [{ type: String, trim: true, lowercase: true }],
  interests: [{ type: String, trim: true, lowercase: true }],
  social: {
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
  },
}, { _id: false, timestamps: true });

const UserSchema = new Schema({
  collegeEmail: { type: String, required: true, unique: true, lowercase: true, index: true },
  name: { type: String, required: true, trim: true },
  avatarUrl: { type: String },
  // Derived from college ID/username
  branch: { type: String, required: true, trim: true, uppercase: true }, // e.g., CSE, EEE
  year: { type: Number, required: true, min: 1, max: 5 },
  className: { type: String, required: true, trim: true }, // e.g., BTech, MTech
  section: { type: String, required: true, trim: true, uppercase: true }, // e.g., A, B
  rollNumber: { type: String, trim: true },

  // Account
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }, // Admin flag for creating groups

  // Embedded additional details
  additional: { type: AdditionalDetailsSchema, default: {} },

  // Status
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
}, { timestamps: true });

UserSchema.index({ branch: 1, year: 1, className: 1, section: 1 });

module.exports = mongoose.model('User', UserSchema);
