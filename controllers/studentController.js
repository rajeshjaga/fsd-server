// server/controllers/studentController.js
const Student = require("../models/Student");
const Job = require("../models/Job");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
	return jwt.sign({ id, role: "student" }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};

exports.registerStudent = async (req, res) => {
	try {
		const { email, password, ...rest } = req.body;

		const studentExists = await Student.findOne({ email });
		if (studentExists)
			return res.status(400).json({ message: "Student already registered" });

		const hashedPassword = await bcrypt.hash(password, 10);
		const student = await Student.create({
			email,
			password: hashedPassword,
			...rest,
		});

		res.status(201).json({
			token: generateToken(student._id),
			student,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.loginStudent = async (req, res) => {
	try {
		const { email, password } = req.body;
		const student = await Student.findOne({ email });
		console.log("Login attempt:", student);
		const isMatch = await bcrypt.compare(password, student.password);
		console.log("Password match:", isMatch);
		if (student && (await bcrypt.compare(password, student.password))) {
			res.json({
				token: generateToken(student._id),
				student,
			});
		} else {
			res.status(401).json({ message: "Invalid credentials" });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getStudentDashboard = async (req, res) => {
	try {
		const student = await Student.findById(req.user.id).populate("appliedJobs");
		res.json(student);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.applyToJob = async (req, res) => {
	try {
		const student = await Student.findById(req.user.id);
		const job = await Job.findById(req.params.jobId);

		if (!student || !job) return res.status(404).json({ message: "Not found" });

		job.applicants.push({ student: student._id });
		student.appliedJobs.push(job._id);

		await job.save();
		await student.save();

		res.json({ message: "Applied successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
