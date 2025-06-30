// server/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  age: Number,
  department: String,
  experience: String,
  education: {
    tenth: Number,
    twelfth: Number,
    degree: Number,
    masters: Number
  },
  projects: [String],
  skills: [String],
  certifications: [String],
  contact: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

module.exports = mongoose.model('Student', studentSchema);
