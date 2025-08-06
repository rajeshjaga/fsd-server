const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth"); // JWT middleware

// POST /jobs - Create new job (Company Only)
router.post("/", auth, async (req, res) => {
    try {
        const job = new Job({
            ...req.body,
            admin: req.user.id,
        });
        await job.save();
        res.status(201).json({ message: "Job created", job });
    } catch (error) {
        res.status(500).json({ message: "Failed to create job", error });
    }
});

// GET /jobs - Get all jobs with filtering and sorting
router.get("/", auth, async (req, res) => {
    try {
        const { limit, sort, status } = req.query;
        let query = {};
        let sortOptions = {};

        // If requesting recent jobs for dashboard
        if (sort === 'recent') {
            query.admin = req.user.id; // Only get jobs by this admin
            sortOptions = { createdAt: -1 };
        }

        // Apply status filter if provided
        if (status) {
            query.status = status;
        }

        let jobsQuery = Job.find(query).populate("admin", "name email");

        // Apply sorting
        if (Object.keys(sortOptions).length > 0) {
            jobsQuery = jobsQuery.sort(sortOptions);
        }

        // Apply limit
        if (limit) {
            jobsQuery = jobsQuery.limit(parseInt(limit));
        }

        const jobs = await jobsQuery.lean();

        // Format jobs for frontend
        const formattedJobs = jobs.map(job => ({
            _id: job._id,
            id: job._id,
            title: job.title,
            companyName: job.companyName || (job.admin ? job.admin.name : 'Unknown Company'),
            applicationsCount: job.applicants ? job.applicants.length : 0,
            applicants: job.applicants ? job.applicants.length : 0,
            status: job.status || 'open',
            createdAt: job.createdAt,
            datePosted: job.createdAt,
            location: job.location,
            salary: job.salary,
            description: job.description,
            requirements: job.requirements,
            admin: job.admin
        }));

        res.json({
            jobs: formattedJobs,
            total: formattedJobs.length
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: "Error fetching jobs", error: error.message });
    }
});

// GET /jobs/my-jobs - Get jobs posted by the logged-in company
router.get("/my-jobs", auth, async (req, res) => {
    try {
        const jobs = await Job.find({ admin: req.user.id })
            .sort({ createdAt: -1 })
            .populate("admin", "name email")
            .lean();

        const formattedJobs = jobs.map(job => ({
            _id: job._id,
            id: job._id,
            title: job.title,
            companyName: job.companyName || (job.admin ? job.admin.name : 'Unknown Company'),
            applicationsCount: job.applicants ? job.applicants.length : 0,
            status: job.status || 'open',
            createdAt: job.createdAt,
            location: job.location,
            salary: job.salary
        }));

        res.json({ jobs: formattedJobs });
    } catch (error) {
        console.error('Error fetching user jobs:', error);
        res.status(500).json({ message: "Error fetching your jobs", error: error.message });
    }
});

// POST /jobs/:id/apply - Student applies to a job
router.post("/:id/apply", auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.applicants.includes(req.user.id)) {
            return res.status(400).json({ message: "Already applied to this job" });
        }

        job.applicants.push(req.user.id);
        await job.save();

        res.json({ message: "Application successful" });
    } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ message: "Application failed", error: error.message });
    }
});

// GET /jobs/:id - Get specific job details
// Add this new route to your job routes file
router.post("/bulk", async (req, res) => {
    try {
        const { jobIds } = req.body;

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            return res.status(400).json({ message: "Job IDs array is required" });
        }

        // Fetch all jobs in one database query
        const jobs = await Job.find({ _id: { $in: jobIds } })
            .populate("admin", "name email")
            .lean(); // Use lean() for better performance

        // Format all jobs
        const formattedJobs = jobs.map(job => ({
            _id: job._id,
            id: job._id,
            title: job.title,
            companyName: job.companyName || (job.admin ? job.admin.name : 'Unknown Company'),
            jobDescription: job.jobDescription || job.description,
            skillsRequired: job.skillsRequired || [],
            minMarks: job.minMarks || {
                tenth: 0,
                twelfth: 0,
                ug: 0,
                pg: 0
            },
            applicationDeadline: job.applicationDeadline,
            applicationsCount: job.applicants ? job.applicants.length : 0,
            status: job.status || 'open',
            createdAt: job.createdAt,
            location: job.location,
            salary: job.salary,
            description: job.description || job.jobDescription,
            requirements: job.requirements,
            experience: job.experience,
            jobType: job.jobType,
            admin: job.admin
        }));

        res.json({
            success: true,
            jobs: formattedJobs,
            count: formattedJobs.length
        });
    } catch (error) {
        console.error('Error fetching multiple jobs:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching jobs",
            error: error.message
        });
    }
});

// Keep the existing single job route for individual lookups
router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("admin", "name email");
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        const formattedJob = {
            _id: job._id,
            id: job._id,
            title: job.title,
            companyName: job.companyName || (job.admin ? job.admin.name : 'Unknown Company'),
            jobDescription: job.jobDescription || job.description,
            skillsRequired: job.skillsRequired || [],
            minMarks: job.minMarks || {
                tenth: 0,
                twelfth: 0,
                ug: 0,
                pg: 0
            },
            applicationDeadline: job.applicationDeadline,
            applicationsCount: job.applicants ? job.applicants.length : 0,
            status: job.status || 'open',
            createdAt: job.createdAt,
            location: job.location,
            salary: job.salary,
            description: job.description || job.jobDescription,
            requirements: job.requirements,
            experience: job.experience,
            jobType: job.jobType,
            admin: job.admin
        };
        res.json(formattedJob);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ message: "Error fetching job", error: error.message });
    }
});

// PUT /jobs/:id - Update job (Company only - their own jobs)
router.put("/:id", auth, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, admin: req.user.id });
        if (!job) {
            return res.status(404).json({ message: "Job not found or unauthorized" });
        }

        Object.assign(job, req.body);
        await job.save();

        res.json({ message: "Job updated successfully", job });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: "Error updating job", error: error.message });
    }
});

// DELETE /jobs/:id - Delete job (Company only - their own jobs)
router.delete("/:id", auth, async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, admin: req.user.id });
        if (!job) {
            return res.status(404).json({ message: "Job not found or unauthorized" });
        }

        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: "Error deleting job", error: error.message });
    }
});

module.exports = router;// const express = require("express");
// const router = express.Router();
// const Job = require("../models/Job");
// const auth = require("../middleware/auth"); // JWT middleware
//
// // POST /jobs - Create new job (Company Only)
// router.post("/", auth, async (req, res) => {
//     try {
//         const job = new Job({
//             ...req.body,
//             admin: req.user.id,
//         });
//         await job.save();
//         res.status(201).json({ message: "Job created", job });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to create job", error });
//     }
// });
//
// // GET /jobs - Get all jobs
// router.get("/", async (req, res) => {
//     try {
//         const jobs = await Job.find().populate("admin", "name email");
//         res.json(jobs);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching jobs", error });
//     }
// });
//
// // GET /jobs/ - Get jobs posted by the logged-in company
// router.get("/job", auth, async (req, res) => {
//     try {
//         const jobs = await Job.find({ admin: req.user.id });
//         res.json(jobs);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching your jobs", error });
//     }
// });
//
// // POST /jobs/:id/apply - Student applies to a job
// router.post("/:id/apply", auth, async (req, res) => {
//     try {
//         const job = await Job.findById(req.params.id);
//         if (!job) return res.status(404).json({ message: "Job not found" });
//
//         if (job.applicants.includes(req.user.id)) {
//             return res.status(400).json({ message: "Already applied to this job" });
//         }
//
//         job.applicants.push(req.user.id);
//         await job.save();
//         res.json({ message: "Application successful" });
//     } catch (error) {
//         res.status(500).json({ message: "Application failed", error });
//     }
// });
//
// module.exports = router;
