const express = require('express');
const router = express.Router();
const {
  getAdminStatistics,
  getAdminUsers,
  updateUserStatus,
  adjustUserBalance,
  getAdminTransactions
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// All routes here require valid JWT and Admin role
router.use(authenticateToken, requireAdmin);

router.get('/statistics', getAdminStatistics);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', updateUserStatus);
router.post('/users/:id/adjust-balance', adjustUserBalance);
router.get('/transactions', getAdminTransactions);

module.exports = router;
