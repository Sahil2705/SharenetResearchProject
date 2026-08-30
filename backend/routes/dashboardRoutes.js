const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getDashboardData);

module.exports = router;
