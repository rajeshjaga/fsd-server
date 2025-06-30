// server/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getStudentDashboard,
  applyToJob
} = require('../controllers/studentController');
const { protectStudent } = require('../middleware/authMiddleware');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/dashboard', protectStudent, getStudentDashboard);
router.post('/apply/:jobId', protectStudent, applyToJob);

module.exports = router;
