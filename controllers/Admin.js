const admin = require("../models/Admin");
const Job = require("../models/Job");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
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
            } else {
                res.status(401).json({ message: "Invalid credentials" });
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
        const Admin = await admin.findById(req.user._id).populate({
            path: "jobs",
            populate: { path: "applicants.student" },
        });
        if (Admin) {
            res.json(Admin);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// NEW: Dashboard Stats - matches frontend /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get current date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Aggregate job statistics
        const [
            totalJobs,
            monthlyJobs,
            lastMonthJobs,
            totalApplications,
            profileViews
        ] = await Promise.all([
            Job.countDocuments({ admin: userId }),
            Job.countDocuments({
                admin: userId,
                createdAt: { $gte: startOfMonth }
            }),
            Job.countDocuments({
                admin: userId,
                createdAt: {
                    $gte: startOfLastMonth,
                    $lte: endOfLastMonth
                }
            }),
            Job.aggregate([
                { $match: { admin: userId } },
                { $project: { applicantCount: { $size: "$applicants" } } },
                { $group: { _id: null, total: { $sum: "$applicantCount" } } }
            ]),
            // Mock profile views - implement actual tracking as needed
            Promise.resolve([{ total: Math.floor(Math.random() * 2000) + 500 }])
        ]);

        // Calculate percentage changes
        const jobsChange = lastMonthJobs > 0
            ? `${Math.round(((monthlyJobs - lastMonthJobs) / lastMonthJobs) * 100)}%`
            : monthlyJobs > 0 ? "+100%" : "0%";

        // Calculate applications change (you can enhance this)
        const applicationsChange = "+8%"; // Placeholder - calculate actual change
        const viewsChange = "+23%"; // Placeholder - calculate actual change

        const stats = {
            totalJobs: totalJobs.toString(),
            totalApplications: totalApplications[0]?.total?.toString() || "0",
            profileViews: profileViews[0]?.total?.toString() || "0",
            monthlyJobs: monthlyJobs.toString(),
            jobsChange: jobsChange,
            applicationsChange: applicationsChange,
            viewsChange: viewsChange,
            monthlyChange: jobsChange
        };

        res.json(stats);
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats", error });
    }
};

// NEW: Recent Jobs - matches frontend /api/jobs/recent
exports.getRecentJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ admin: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title applicants status createdAt')
            .lean();

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            title: job.title,
            applicants: job.applicants ? job.applicants.length : 0,
            status: job.status || "Active",
            posted: getTimeAgo(job.createdAt)
        }));

        res.json({ jobs: formattedJobs });
    } catch (error) {
        console.error("Recent jobs error:", error);
        res.status(500).json({ message: "Error fetching recent jobs", error });
    }
};

// Get all jobs by admin
exports.getAdminJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ admin: req.user._id });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your jobs", error });
    }
};
// const admin = require("../models/Admin");
// const Job = require("../models/Job");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
//
// const generateToken = (id) => {
//     return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
//         expiresIn: "7d",
//     });
// };
//
// exports.registeradmin = async (req, res) => {
//     try {
//         const { email, password, ...rest } = req.body;
//
//         const exists = await admin.findOne({ email });
//         if (exists) {
//             return res.status(400).json({ message: "admin already exists" });
//         }
//
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const Admin = await admin.create({ email, password: hashedPassword, ...rest });
//
//         res.status(201).json({
//             token: generateToken(Admin._id),
//             Admin
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
//
// exports.loginadmin = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const Admin = await admin.findOne({ email });
//
//         if (Admin) {
//             const isMatch = await bcrypt.compare(password, Admin.password);
//             const id = Admin._id.toHexString()
//             if (isMatch) {
//                 res.status(200).json({
//                     token: generateToken(id),
//                     Admin,
//                 });
//             }
//         } else {
//             res.status(401).json({ message: "Invalid credentials" });
//         }
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
//
// exports.postJob = async (req, res) => {
//     try {
//         const job = await Job.create({
//             ...req.body,
//             admin: req.user._id,
//         });
//         console.log(job)
//
//         const Admin = await admin.findById(req.user._id);
//         Admin.jobs.push(job._id);
//         await Admin.save();
//
//         res.status(201).json(job);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
//
// exports.getDashboard = async (req, res) => {
//     try {
//         const admin = await admin.findById(req.user._id).populate({
//             path: "jobs",
//             populate: { path: "applicants.student" },
//         });
//         if (admin) {
//             res.json(admin);
//         }
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
//
