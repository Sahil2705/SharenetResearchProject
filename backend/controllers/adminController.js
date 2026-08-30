const { query } = require('../config/db');
const { successResponse, badRequestResponse, notFoundResponse, errorResponse } = require('../utils/responseHandler');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Get platform-wide statistics for admin dashboard
 */
const getAdminStatistics = async (req, res) => {
  try {
    // 1. User stats
    const [userCountRows] = await query('SELECT COUNT(id) as total_users FROM users');
    const [activeUserRows] = await query("SELECT COUNT(id) as active_users FROM users WHERE status = 'active'");
    const [suspendedUserRows] = await query("SELECT COUNT(id) as suspended_users FROM users WHERE status = 'suspended'");

    // 2. Data stats
    const [dataTotals] = await query(
      'SELECT COALESCE(SUM(total_data), 0) as platform_total_data, COALESCE(SUM(available_data), 0) as platform_available_data, COALESCE(SUM(stored_data), 0) as platform_stored_data FROM users'
    );

    // 3. Transfer totals
    const [transferTotals] = await query(
      "SELECT COALESCE(SUM(amount), 0) as total_transferred, COUNT(id) as transfer_count FROM transactions WHERE type = 'transfer_sent' AND status = 'completed'"
    );

    // 4. Vault totals
    const [vaultTotals] = await query(
      "SELECT COALESCE(SUM(amount), 0) as total_vault_locked FROM data_storage WHERE status = 'stored'"
    );

    // 5. Total transactions
    const [trxTotals] = await query('SELECT COUNT(id) as total_transactions FROM transactions');

    // 6. Recent platform transactions
    const [recentTransactions] = await query(
      `SELECT t.id, t.transaction_code, t.sender_id, t.receiver_id, t.type, t.amount, t.status, t.note, t.created_at,
              s.full_name as sender_name, s.email as sender_email,
              r.full_name as receiver_name, r.email as receiver_email
       FROM transactions t
       LEFT JOIN users s ON t.sender_id = s.id
       LEFT JOIN users r ON t.receiver_id = r.id
       ORDER BY t.created_at DESC
       LIMIT 10`
    );

    return successResponse(res, {
      totalUsers: userCountRows[0]?.total_users || 0,
      activeUsers: activeUserRows[0]?.active_users || 0,
      suspendedUsers: suspendedUserRows[0]?.suspended_users || 0,
      platformTotalData: parseFloat(dataTotals[0]?.platform_total_data || 0),
      platformAvailableData: parseFloat(dataTotals[0]?.platform_available_data || 0),
      platformStoredData: parseFloat(dataTotals[0]?.platform_stored_data || 0),
      totalDataTransferred: parseFloat(transferTotals[0]?.total_transferred || 0),
      totalTransactions: trxTotals[0]?.total_transactions || 0,
      totalVaultLocked: parseFloat(vaultTotals[0]?.total_vault_locked || 0),
      recentTransactions
    }, 'Admin statistics retrieved.');
  } catch (error) {
    console.error('Admin Statistics Error:', error);
    return errorResponse(res, 'Failed to fetch admin statistics.');
  }
};

/**
 * Get all users with search, role/status filter, and pagination
 */
const getAdminUsers = async (req, res) => {
  try {
    const { search = '', status = 'all', role = 'all', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * pageLimit;

    const [allUsers] = await query(
      `SELECT id, full_name, email, phone, role, status, total_data, available_data, stored_data, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    let filtered = [...allUsers];

    if (status !== 'all') {
      filtered = filtered.filter(u => u.status === status);
    }

    if (role !== 'all') {
      filtered = filtered.filter(u => u.role === role);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + pageLimit);

    return successResponse(res, {
      users: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit)
      }
    }, 'Users retrieved.');
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    return errorResponse(res, 'Failed to fetch users list.');
  }
};

/**
 * Toggle or update user account status (active / suspended)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return badRequestResponse(res, 'Invalid status. Must be "active" or "suspended".');
    }

    // Prevent admin from suspending self
    if (parseInt(id, 10) === req.user.id) {
      return badRequestResponse(res, 'You cannot modify your own administrator status.');
    }

    const [userRows] = await query('SELECT id, full_name, email, role FROM users WHERE id = ?', [id]);
    if (!userRows || userRows.length === 0) {
      return notFoundResponse(res, 'User not found.');
    }

    await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    await createNotification({
      userId: id,
      title: 'Account Status Update',
      message: `Your account status was changed to "${status}" by an administrator.`,
      type: 'account_alert'
    });

    return successResponse(res, { id, status }, `User status updated to ${status}.`);
  } catch (error) {
    console.error('Update User Status Error:', error);
    return errorResponse(res, 'Failed to update user status.');
  }
};

/**
 * Admin: Adjust user data balance (grant bonus data or adjust)
 */
const adjustUserBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason = 'Admin Balance Adjustment' } = req.body;
    const adjustAmount = parseFloat(amount);

    if (isNaN(adjustAmount) || adjustAmount === 0) {
      return badRequestResponse(res, 'Please provide a valid non-zero adjustment amount.');
    }

    const [userRows] = await query('SELECT id, full_name, email, available_data, total_data FROM users WHERE id = ?', [id]);
    if (!userRows || userRows.length === 0) {
      return notFoundResponse(res, 'User not found.');
    }

    const user = userRows[0];
    const newAvailable = Math.max(0, parseFloat(user.available_data) + adjustAmount);
    const newTotal = Math.max(0, parseFloat(user.total_data) + (adjustAmount > 0 ? adjustAmount : 0));

    await query(
      'UPDATE users SET available_data = ?, total_data = ? WHERE id = ?',
      [newAvailable, newTotal, id]
    );

    const trxCode = `SN-ADJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await query(
      `INSERT INTO transactions (transaction_code, sender_id, receiver_id, type, amount, status, note)
       VALUES (?, ?, ?, 'admin_adjustment', ?, 'completed', ?)`,
      [trxCode, req.user.id, id, Math.abs(adjustAmount), reason]
    );

    await createNotification({
      userId: id,
      title: adjustAmount > 0 ? 'Admin Bonus Credited' : 'Balance Adjusted',
      message: `Administrator adjusted your data balance by ${adjustAmount > 0 ? '+' : ''}${adjustAmount.toFixed(2)} GB. Reason: ${reason}`,
      type: 'account_alert'
    });

    return successResponse(res, {
      userId: id,
      new_available_data: newAvailable,
      adjusted_amount: adjustAmount
    }, `User balance updated successfully.`);
  } catch (error) {
    console.error('Adjust User Balance Error:', error);
    return errorResponse(res, 'Failed to adjust user balance.');
  }
};

/**
 * Get all platform transactions for admin audit view
 */
const getAdminTransactions = async (req, res) => {
  try {
    const { search = '', type = 'all', page = 1, limit = 25 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const offset = (pageNum - 1) * pageLimit;

    const [allTransactions] = await query(
      `SELECT t.id, t.transaction_code, t.sender_id, t.receiver_id, t.type, t.amount, t.status, t.note, t.created_at,
              s.full_name as sender_name, s.email as sender_email,
              r.full_name as receiver_name, r.email as receiver_email
       FROM transactions t
       LEFT JOIN users s ON t.sender_id = s.id
       LEFT JOIN users r ON t.receiver_id = r.id
       ORDER BY t.created_at DESC`
    );

    let filtered = [...allTransactions];

    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(t =>
        t.transaction_code.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.sender_name && t.sender_name.toLowerCase().includes(q)) ||
        (t.receiver_name && t.receiver_name.toLowerCase().includes(q)) ||
        (t.sender_email && t.sender_email.toLowerCase().includes(q)) ||
        (t.receiver_email && t.receiver_email.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + pageLimit);

    return successResponse(res, {
      transactions: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit)
      }
    }, 'Admin transactions retrieved.');
  } catch (error) {
    console.error('Admin Transactions Error:', error);
    return errorResponse(res, 'Failed to fetch platform transactions.');
  }
};

module.exports = {
  getAdminStatistics,
  getAdminUsers,
  updateUserStatus,
  adjustUserBalance,
  getAdminTransactions
};
