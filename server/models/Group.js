const mongoose = require('mongoose');
const { Schema } = mongoose;

// Group represents cohorts by branch/class/section/year and optional clubs
const GroupSchema = new Schema({
  type: { type: String, enum: ['cohort', 'club', 'department', 'custom'], default: 'cohort', index: true },
  name: { type: String, required: true, trim: true },
  branch: { type: String, trim: true, uppercase: true },
  className: { type: String, trim: true },
  section: { type: String, trim: true, uppercase: true },
  year: { type: Number, min: 1, max: 5 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isAutoAssigned: { type: Boolean, default: false },
  description: { type: String, maxlength: 300 },
}, { timestamps: true });

GroupSchema.index({ type: 1, branch: 1, className: 1, section: 1, year: 1 });

module.exports = mongoose.model('Group', GroupSchema);
