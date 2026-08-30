const { query } = require('../config/db');
const { successResponse, badRequestResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get all notifications for user
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT id, user_id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const unreadCount = rows.filter(n => !n.is_read).length;

    return successResponse(res, {
      notifications: rows,
      unreadCount
    }, 'Notifications retrieved.');
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return errorResponse(res, 'Failed to fetch notifications.');
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return successResponse(res, null, 'Notification marked as read.');
  } catch (error) {
    console.error('Mark As Read Error:', error);
    return errorResponse(res, 'Failed to update notification.');
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    return successResponse(res, null, 'All notifications marked as read.');
  } catch (error) {
    console.error('Mark All As Read Error:', error);
    return errorResponse(res, 'Failed to update notifications.');
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
