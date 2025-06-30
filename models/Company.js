// server/models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  recruiterName: { type: String, required: true },
  orgSize: String,
  domain: String,
  email: { type: String, required: true, unique: true },
  contact: String,
  password: { type: String, required: true },
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

module.exports = mongoose.model('Company', companySchema);
