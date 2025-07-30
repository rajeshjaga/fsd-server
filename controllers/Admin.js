const admin = require("../models/Admin");
const Job = require("../models/Job");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");

const generateToken = (id) => {
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

exports.registeradmin = async (req, res) => {
    try {
        const { email, password, ...rest } = req.body;

        const exists = await admin.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const Admin = await admin.create({ email, password: hashedPassword, ...rest });

        res.status(201).json({
            token: generateToken(Admin._id),
            Admin
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.loginadmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const Admin = await admin.findOne({ email });

        if (Admin) {
            const isMatch = await bcrypt.compare(password, Admin.password);
            const id = Admin._id.toHexString()
            if (isMatch) {
                res.status(200).json({
                    token: generateToken(id),
                    Admin,
                });
            }
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.postJob = async (req, res) => {
    try {
        const job = await Job.create({
            ...req.body,
            admin: req.user._id,
        });
        console.log(job)

        const Admin = await admin.findById(req.user._id);
        Admin.jobs.push(job._id);
        await Admin.save();

        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const admin = await admin.findById(req.user._id).populate({
            path: "jobs",
            populate: { path: "applicants.student" },
        });
        if (admin) {
            res.json(admin);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.shortlistCandidate = async (req, res) => {
    try {
        const { jobId, studentId } = req.params;
        const job = await Job.findById(jobId);

        const applicant = job.applicants.find(
            (a) => a.student.toString() === studentId,
        );
        if (!applicant)
            return res.status(404).json({ message: "Applicant not found" });

        applicant.status = "shortlisted";
        await job.save();

        const student = await Student.findById(studentId);
        await sendMail(
            student.email,
            "You are shortlisted!",
            `Congratulations! You've been shortlisted for ${job.title}`,
        );

        res.json({ message: "Candidate shortlisted and mail sent" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
