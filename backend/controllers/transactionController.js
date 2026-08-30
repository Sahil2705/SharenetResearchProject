const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get user transaction history with search, type filters, date sorting, and pagination
 */
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type = 'all',
      status = 'all',
      search = '',
      sort = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * pageLimit;

    // Fetch user transactions
    const [allTransactions] = await query(
      `SELECT t.id, t.transaction_code, t.sender_id, t.receiver_id, t.type, t.amount, t.status, t.note, t.created_at,
              s.full_name as sender_name, s.email as sender_email,
              r.full_name as receiver_name, r.email as receiver_email
       FROM transactions t
       LEFT JOIN users s ON t.sender_id = s.id
       LEFT JOIN users r ON t.receiver_id = r.id
       WHERE t.sender_id = ? OR t.receiver_id = ?
       ORDER BY t.created_at DESC`,
      [userId, userId]
    );

    let filtered = [...allTransactions];

    // 1. Filter by transaction type
    if (type !== 'all') {
      if (type === 'sent') {
        filtered = filtered.filter(t => t.type === 'transfer_sent');
      } else if (type === 'received') {
        filtered = filtered.filter(t => t.type === 'transfer_received' || t.type === 'bonus_allocated');
      } else if (type === 'stored') {
        filtered = filtered.filter(t => t.type === 'vault_stored');
      } else if (type === 'restored') {
        filtered = filtered.filter(t => t.type === 'vault_restored');
      } else {
        filtered = filtered.filter(t => t.type === type);
      }
    }

    // 2. Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(t => t.status === status);
    }

    // 3. Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(t => 
        (t.transaction_code && t.transaction_code.toLowerCase().includes(q)) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.sender_name && t.sender_name.toLowerCase().includes(q)) ||
        (t.sender_email && t.sender_email.toLowerCase().includes(q)) ||
        (t.receiver_name && t.receiver_name.toLowerCase().includes(q)) ||
        (t.receiver_email && t.receiver_email.toLowerCase().includes(q))
      );
    }

    // 4. Sort
    if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sort === 'amount_high') {
      filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    } else if (sort === 'amount_low') {
      filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    } else {
      // Default: newest
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice(offset, offset + pageLimit);
    const totalPages = Math.ceil(totalCount / pageLimit);

    return successResponse(res, {
      transactions: paginated,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: pageLimit,
        totalPages
      }
    }, 'Transactions retrieved.');
  } catch (error) {
    console.error('Get Transactions Error:', error);
    return errorResponse(res, 'Failed to fetch transaction history.');
  }
};

/**
 * Get details for a single transaction by ID or code
 */
const getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await query(
      `SELECT t.id, t.transaction_code, t.sender_id, t.receiver_id, t.type, t.amount, t.status, t.note, t.created_at,
              s.full_name as sender_name, s.email as sender_email,
              r.full_name as receiver_name, r.email as receiver_email
       FROM transactions t
       LEFT JOIN users s ON t.sender_id = s.id
       LEFT JOIN users r ON t.receiver_id = r.id
       WHERE (t.id = ? OR t.transaction_code = ?) AND (t.sender_id = ? OR t.receiver_id = ? OR ? = 'admin')`,
      [id, id, userId, userId, req.user.role]
    );

    if (!rows || rows.length === 0) {
      return errorResponse(res, 'Transaction not found or access denied.', 404);
    }

    return successResponse(res, rows[0]);
  } catch (error) {
    console.error('Get Transaction By ID Error:', error);
    return errorResponse(res, 'Failed to fetch transaction details.');
  }
};

module.exports = {
  getTransactions,
  getTransactionById
};
