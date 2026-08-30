const express = require('express');
const router = express.Router();
const { searchReceiver, transferData } = require('../controllers/transferController');
const { authenticateToken } = require('../middleware/auth');
const { validateDataAmount } = require('../middleware/validator');

router.get('/search', authenticateToken, searchReceiver);
router.post('/send', authenticateToken, validateDataAmount, transferData);

module.exports = router;
