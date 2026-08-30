const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getTransactionConnection } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { successResponse, createdResponse, badRequestResponse, unauthorizedResponse, errorResponse } = require('../utils/responseHandler');
const { createNotification } = require('../utils/notificationHelper');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 * Initial starter balance: 10.00 GB
 */
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if email or phone already registered
    const [existingUsers] = await query(
      'SELECT id, email, phone FROM users WHERE email = ? OR phone = ?',
      [cleanEmail, cleanPhone]
    );

    if (existingUsers && existingUsers.length > 0) {
      const match = existingUsers[0];
      if (match.email.toLowerCase() === cleanEmail) {
        return badRequestResponse(res, 'An account with this email address already exists.');
      }
      return badRequestResponse(res, 'An account with this phone number already exists.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const initialData = 10.00; // 10 GB welcome allocation

    // Insert new user
    const [result] = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, status, total_data, available_data, stored_data)
       VALUES (?, ?, ?, ?, 'user', 'active', ?, ?, 0.00)`,
      [full_name.trim(), cleanEmail, cleanPhone, password_hash, initialData, initialData]
    );

    const newUserId = result.insertId;

    // Record welcome bonus transaction
    const trxCode = `SN-TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await query(
      `INSERT INTO transactions (transaction_code, sender_id, receiver_id, type, amount, status, note)
       VALUES (?, NULL, ?, 'bonus_allocated', ?, 'completed', 'Welcome Starter Bonus Allowance')`,
      [trxCode, newUserId, initialData]
    );

    // Create welcome notification
    await createNotification({
      userId: newUserId,
      title: 'Welcome to SmartNet!',
      message: `Your account is active and credited with ${initialData.toFixed(2)} GB of starter data allowance.`,
      type: 'system'
    });

    const userPayload = {
      id: newUserId,
      full_name: full_name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: 'user',
      status: 'active',
      total_data: initialData,
      available_data: initialData,
      stored_data: 0.00
    };

    const token = jwt.sign(
      { id: newUserId, email: cleanEmail, role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return createdResponse(res, { token, user: userPayload }, 'Account registered successfully! 10.00 GB credited.');
  } catch (error) {
    console.error('Registration Error:', error);
    return errorResponse(res, 'Failed to register user. Please try again.');
  }
};

/**
 * Log in existing user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Query user by email
    const [users] = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!users || users.length === 0) {
      return unauthorizedResponse(res, 'Invalid email or password credentials.');
    }

    const user = users[0];

    // Check account status
    if (user.status === 'suspended') {
      return badRequestResponse(res, 'Your account is suspended. Please contact administrator.');
    }

    // Verify bcrypt password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid email or password credentials.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userPayload = {
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

    return successResponse(res, { token, user: userPayload }, 'Logged in successfully.');
  } catch (error) {
    console.error('Login Error:', error);
    return errorResponse(res, 'Authentication failed. Please try again.');
  }
};

/**
 * Get current authenticated user profile
 */
const getProfile = async (req, res) => {
  try {
    const [users] = await query(
      'SELECT id, full_name, email, phone, role, status, total_data, available_data, stored_data, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users || users.length === 0) {
      return badRequestResponse(res, 'User not found.');
    }

    const user = users[0];
    return successResponse(res, {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      total_data: parseFloat(user.total_data || 0),
      available_data: parseFloat(user.available_data || 0),
      stored_data: parseFloat(user.stored_data || 0),
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return errorResponse(res, 'Failed to fetch user profile.');
  }
};

/**
 * Update user full name or phone
 */
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;

    if (!full_name || full_name.trim().length < 2) {
      return badRequestResponse(res, 'Full name must be at least 2 characters.');
    }

    if (!phone || phone.trim().length < 6) {
      return badRequestResponse(res, 'Valid phone number is required.');
    }

    // Check if phone taken by another user
    const [existingPhone] = await query(
      'SELECT id FROM users WHERE phone = ? AND id != ?',
      [phone.trim(), req.user.id]
    );

    if (existingPhone && existingPhone.length > 0) {
      return badRequestResponse(res, 'This phone number is already registered to another account.');
    }

    await query(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [full_name.trim(), phone.trim(), req.user.id]
    );

    return successResponse(res, {
      ...req.user,
      full_name: full_name.trim(),
      phone: phone.trim()
    }, 'Profile updated successfully.');
  } catch (error) {
    console.error('Update Profile Error:', error);
    return errorResponse(res, 'Failed to update profile.');
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return badRequestResponse(res, 'Current and new password are both required.');
    }

    if (new_password.length < 6) {
      return badRequestResponse(res, 'New password must be at least 6 characters long.');
    }

    const [users] = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return badRequestResponse(res, 'User not found.');
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) {
      return badRequestResponse(res, 'Current password entered is incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    await createNotification({
      userId: req.user.id,
      title: 'Security Alert: Password Changed',
      message: 'Your account password was successfully updated.',
      type: 'account_alert'
    });

    return successResponse(res, null, 'Password updated successfully.');
  } catch (error) {
    console.error('Change Password Error:', error);
    return errorResponse(res, 'Failed to change password.');
  }
};

/**
 * Simulation Helper: Top up simulated data balance for testing
 */
const topUpSimulatedData = async (req, res) => {
  try {
    const { amount = 10 } = req.body;
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 100) {
      return badRequestResponse(res, 'Top up amount must be between 1 and 100 GB.');
    }

    await query(
      'UPDATE users SET available_data = available_data + ?, total_data = total_data + ? WHERE id = ?',
      [numAmount, numAmount, req.user.id]
    );

    const trxCode = `SN-TOP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await query(
      `INSERT INTO transactions (transaction_code, sender_id, receiver_id, type, amount, status, note)
       VALUES (?, NULL, ?, 'bonus_allocated', ?, 'completed', 'Simulation Data Balance Top-up')`,
      [trxCode, req.user.id, numAmount]
    );

    await createNotification({
      userId: req.user.id,
      title: 'Data Balance Top-up',
      message: `Added ${numAmount.toFixed(2)} GB simulated data balance to your account.`,
      type: 'system'
    });

    return successResponse(res, { added: numAmount }, `Successfully added ${numAmount.toFixed(2)} GB to your available balance.`);
  } catch (error) {
    console.error('Topup Error:', error);
    return errorResponse(res, 'Failed to top up simulated data balance.');
  }
};

/**
 * Logout
 */
const logout = (req, res) => {
  return successResponse(res, null, 'Logged out successfully.');
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  topUpSimulatedData,
  logout
};
