const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responseHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'smartnet_super_secret_jwt_key_2026_production_grade';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return unauthorizedResponse(res, 'Access denied. No authorization token provided.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return unauthorizedResponse(res, 'Session expired. Please log in again.');
      }
      return unauthorizedResponse(res, 'Invalid authentication token.');
    }

    // Verify user still exists and is active in database
    const [users] = await query('SELECT id, full_name, email, phone, role, status, total_data, available_data, stored_data, created_at FROM users WHERE id = ?', [decoded.id]);
    
    if (!users || users.length === 0) {
      return unauthorizedResponse(res, 'User account no longer exists.');
    }

    const user = users[0];

    if (user.status === 'suspended') {
      return forbiddenResponse(res, 'Your account has been suspended by an administrator. Please contact support.');
    }

    // Attach verified user to request context
    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      total_data: parseFloat(user.total_data || 0),
      available_data: parseFloat(user.available_data || 0),
      stored_data: parseFloat(user.stored_data || 0),
      created_at: user.created_at
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return unauthorizedResponse(res, 'Authentication failed.');
  }
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};
