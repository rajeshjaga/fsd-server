const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    title: { type: String, required: true },
    jobDescription: { type: String, required: true },
    skillsRequired: [String],
    minMarks: {
        type: {
            tenth: { type: Number, required: true },
            twelfth: { type: Number, required: true },
            ug: { type: Number, required: true },
            pg: Number
        },
        required: true
    },
    status: { type: String, enum: ['open', 'closed'], required: true, default: 'open' },
    applicationDeadline: { type: Date },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admins' },
    applicants: [
        {
            student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
            status: { type: String, enum: ['applied', 'shortlisted'], default: 'applied' }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
