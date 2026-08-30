const { query } = require('../config/db');

/**
 * Creates a persistent notification for a user
 * @param {Object} params
 * @param {number} params.userId - Target user ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification detailed message
 * @param {string} params.type - 'transfer_success' | 'transfer_received' | 'vault_stored' | 'vault_restored' | 'account_alert' | 'system'
 */
async function createNotification({ userId, title, message, type = 'system' }) {
  try {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES (?, ?, ?, ?, 0)
    `;
    await query(sql, [userId, title, message, type]);
    return true;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return false;
  }
}

module.exports = {
  createNotification
};
