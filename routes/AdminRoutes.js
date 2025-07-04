const express = require('express');
const router = express.Router();
const {
    registeradmin,
    loginadmin,
    postJob,
    getDashboard,
    shortlistCandidate
} = require('../controllers/Admin');
const { protectadmin } = require('../middleware/authMiddleware');

router.post('/register', registeradmin);
router.post('/login', loginadmin);
router.post('/job', protectadmin, postJob);
router.get('/dashboard', protectadmin, getDashboard);
router.post('/shortlist/:jobId/:studentId', protectadmin, shortlistCandidate);

module.exports = router;
