// server/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerCompany,
  loginCompany,
  postJob,
  getDashboard,
  shortlistCandidate
} = require('../controllers/companyController');
const { protectCompany } = require('../middleware/authMiddleware');

router.post('/register', registerCompany);
router.post('/login', loginCompany);
router.post('/job', protectCompany, postJob);
router.get('/dashboard', protectCompany, getDashboard);
router.post('/shortlist/:jobId/:studentId', protectCompany, shortlistCandidate);

module.exports = router;
