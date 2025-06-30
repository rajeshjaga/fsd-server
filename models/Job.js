// server/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  skillsRequired: [String],
  minMarks: Number,
  course: [String],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  applicants: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      status: { type: String, enum: ['applied', 'shortlisted'], default: 'applied' }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
