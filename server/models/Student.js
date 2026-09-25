const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  dob: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  gender: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  backlogs: { type: Number, default: 0 },
  companies: { type: [String], default: [] },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Student', studentSchema);
