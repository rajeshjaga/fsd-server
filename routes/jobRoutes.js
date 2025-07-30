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

// GET /jobs - Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("companyId", "companyName");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error });
  }
});

// GET /jobs/company - Get jobs posted by the logged-in company
router.get("/company", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.user.id });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your jobs", error });
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
    res.status(500).json({ message: "Application failed", error });
  }
});

module.exports = router;
