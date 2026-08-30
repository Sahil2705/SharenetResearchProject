const express = require('express');
const router = express.Router();
const { getTransactions, getTransactionById } = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getTransactions);
router.get('/:id', authenticateToken, getTransactionById);

module.exports = router;
