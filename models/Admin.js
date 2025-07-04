// server/models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    adminName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: String,
    password: { type: String, required: true },
    jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

module.exports = mongoose.model('Admin', companySchema);
