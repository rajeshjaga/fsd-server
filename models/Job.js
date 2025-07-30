// server/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    companyName: String,
    title: String,
    jobDescription: String,
    skillsRequired: [String],
    minMarks: {
        tenth: { type: Number, required: true },
        twelfth: { type: Number, required: true },
        ug: { type: Number, required: true },
        pg: Number
        //think about it, we need to validate if the student is eligible or not using this particular data from here
        //so this data to should reach to ui in such a way this is being met in the UI
        //also check if it take toll on cpu/browser if in case, there are too many job posts and we are comparing the data
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
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
