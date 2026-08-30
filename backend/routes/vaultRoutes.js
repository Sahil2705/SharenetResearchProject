const express = require('express');
const router = express.Router();
const {
  storeData,
  restoreData,
  getStorageHistory,
  getVaultSummary
} = require('../controllers/vaultController');
const { authenticateToken } = require('../middleware/auth');
const { validateDataAmount } = require('../middleware/validator');

router.get('/summary', authenticateToken, getVaultSummary);
router.get('/history', authenticateToken, getStorageHistory);
router.post('/store', authenticateToken, validateDataAmount, storeData);
router.post('/restore', authenticateToken, restoreData);

module.exports = router;
