const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get aggregated dashboard statistics and recent activity for the authenticated user
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch fresh user profile balances
    const [userRows] = await query(
      'SELECT id, full_name, email, phone, role, status, total_data, available_data, stored_data FROM users WHERE id = ?',
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      return errorResponse(res, 'User not found.', 404);
    }

    const user = userRows[0];
    const totalData = parseFloat(user.total_data || 0);
    const availableData = parseFloat(user.available_data || 0);
    const storedData = parseFloat(user.stored_data || 0);

    // 2. Fetch total data sent and received by this user
    const [sentRows] = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_sent, COUNT(id) as count_sent
       FROM transactions 
       WHERE sender_id = ? AND type = 'transfer_sent' AND status = 'completed'`,
      [userId]
    );

    const [receivedRows] = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_received, COUNT(id) as count_received
       FROM transactions 
       WHERE receiver_id = ? AND type = 'transfer_received' AND status = 'completed'`,
      [userId]
    );

    const [vaultStoredRows] = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_vault_stored, COUNT(id) as count_vault_stored
       FROM transactions 
       WHERE sender_id = ? AND type = 'vault_stored' AND status = 'completed'`,
      [userId]
    );

    const [vaultRestoredRows] = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_vault_restored, COUNT(id) as count_vault_restored
       FROM transactions 
       WHERE sender_id = ? AND type = 'vault_restored' AND status = 'completed'`,
      [userId]
    );

    const totalShared = parseFloat(sentRows[0]?.total_sent || 0);
    const totalReceived = parseFloat(receivedRows[0]?.total_received || 0);
    const totalVaultStored = parseFloat(vaultStoredRows[0]?.total_vault_stored || 0);
    const totalVaultRestored = parseFloat(vaultRestoredRows[0]?.total_vault_restored || 0);

    // 3. Fetch recent transactions (last 6)
    const [recentTransactions] = await query(
      `SELECT t.id, t.transaction_code, t.sender_id, t.receiver_id, t.type, t.amount, t.status, t.note, t.created_at,
              s.full_name as sender_name, s.email as sender_email,
              r.full_name as receiver_name, r.email as receiver_email
       FROM transactions t
       LEFT JOIN users s ON t.sender_id = s.id
       LEFT JOIN users r ON t.receiver_id = r.id
       WHERE t.sender_id = ? OR t.receiver_id = ?
       ORDER BY t.created_at DESC
       LIMIT 6`,
      [userId, userId]
    );

    // 4. Fetch recent vault activity (last 5)
    const [recentVaultActivity] = await query(
      `SELECT id, storage_code, amount, status, stored_at, restored_at, notes
       FROM data_storage
       WHERE user_id = ?
       ORDER BY stored_at DESC
       LIMIT 5`,
      [userId]
    );

    // 5. Active stored records in vault (status = 'stored')
    const [activeVaultList] = await query(
      `SELECT id, storage_code, amount, stored_at, notes
       FROM data_storage
       WHERE user_id = ? AND status = 'stored'
       ORDER BY stored_at DESC`,
      [userId]
    );

    // 6. Unread notification count
    const [notifCount] = await query(
      'SELECT COUNT(id) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    // 7. Data Distribution breakdown for donut / bar charts
    const distribution = [
      { name: 'Available Data', value: availableData, color: '#3B82F6' },
      { name: 'Data in Vault', value: storedData, color: '#8B5CF6' },
      { name: 'Shared Data', value: totalShared, color: '#EC4899' },
      { name: 'Received Data', value: totalReceived, color: '#10B981' }
    ];

    return successResponse(res, {
      summary: {
        totalData,
        availableData,
        storedData,
        totalShared,
        totalReceived,
        totalVaultStored,
        totalVaultRestored,
        activeVaultCount: activeVaultList.length,
        unreadNotifications: notifCount[0]?.unread_count || 0
      },
      distribution,
      recentTransactions,
      recentVaultActivity,
      activeVaultRecords: activeVaultList
    }, 'Dashboard data retrieved successfully.');
  } catch (error) {
    console.error('Dashboard Error:', error);
    return errorResponse(res, 'Failed to retrieve dashboard summary.');
  }
};

module.exports = {
  getDashboardData
};
