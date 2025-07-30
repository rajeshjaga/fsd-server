// server/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    usn: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    major: { type: String, required: true },
    experience: String,
    education: {
        tenth: {
            percent: { type: Number, required: true },
            passedYear: { type: Number, required: true },
        },
        twelfth: {
            percent: { type: Number, required: true },
            passedYear: { type: Number, required: true },
        },
        graduate: {
            bachelors: {
                percent: { type: Number, required: true },
                pursuing: Boolean,
                passedYear: Number,
                major: { type: String, required: true },
                degreeType: { type: String, required: true }
            },
            masters: {
                percent: { type: Number, required: true },
                pursuing: Boolean,
                passedYear: Number,
                major: String,
                degreeType: String
            }
        },
    },
    projects: {
        type: Map,
        of: String
    },
    skills: [String],
    certifications: [String],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

module.exports = mongoose.model('Student', studentSchema);
