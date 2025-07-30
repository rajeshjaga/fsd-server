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

    if (!student) {
      console.log(`Login failed: No user found with email: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      console.log(`Login failed: Incorrect password for email: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`Login success for email: ${email}`);
    const id = student._id.toHexString();
    console.log(id);
    res.status(200).json({
      token: generateToken(id),
      student,
    });

  } catch (error) {
    // This will now only catch unexpected server errors (e.g., database connection issue)
    console.error("Server error during login:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const newJobs = await Job.find({
      "applicants.student": { $nin: [student._id] }
    }).populate("admin", "name"); // Optional: populate admin details

    res.json({
      student,
      newJobs
    });
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
