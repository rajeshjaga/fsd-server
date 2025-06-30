// server/controllers/companyController.js
const Company = require("../models/Company");
const Job = require("../models/Job");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");

const generateToken = (id) => {
	return jwt.sign({ id, role: "company" }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};

exports.registerCompany = async (req, res) => {
	try {
		const { email, password, ...rest } = req.body;

		const exists = await Company.findOne({ email });
		if (exists)
			return res.status(400).json({ message: "Company already exists" });

		const company = await Company.create({ email, password, ...rest });

		res.status(201).json({
			company,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.loginCompany = async (req, res) => {
	try {
		const { email, password } = req.body;
		const company = await Company.findOne({ email });

		if (company) {
			res.json({
				company,
			});
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
			company: req.user._id,
		});

		const company = await Company.findById(req.user._id);
		company.jobs.push(job._id);
		await company.save();

		res.status(201).json(job);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getDashboard = async (req, res) => {
	try {
		const company = await Company.findById(req.user._id).populate({
			path: "jobs",
			populate: { path: "applicants.student" },
		});

		res.json(company);
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
