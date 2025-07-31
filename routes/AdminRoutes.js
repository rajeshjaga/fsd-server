const express = require('express');
const router = express.Router();
const {
    registeradmin,
    loginadmin,
    postJob,
    getDashboard,
    getDashboardStats,
    getAdminJobs, getRecentJobs
} = require('../controllers/Admin');
const { protectadmin } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', registeradmin);
router.post('/login', loginadmin);

// Job routes
router.post('/job', protectadmin, postJob);
router.get('/jobs', protectadmin, getAdminJobs);

// Dashboard routes
router.get('/dashboard', protectadmin, getDashboard);
router.get('/dashboard/stats', protectadmin, getDashboardStats);
router.get('/rec', protectadmin, getRecentJobs)

module.exports = router;
// const express = require('express');
// const router = express.Router();
// const {
//   registeradmin,
//   loginadmin,
//   postJob,
//   getDashboard,
// } = require('../controllers/Admin');
// const { protectadmin } = require('../middleware/authMiddleware');
//
// router.post('/register', registeradmin);
// router.post('/login', loginadmin);
// router.post('/job', protectadmin, postJob);
// router.get('/dashboard', protectadmin, getDashboard);
//
// module.exports = router;
