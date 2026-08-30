const { query, getTransactionConnection } = require('../config/db');
const { successResponse, badRequestResponse, notFoundResponse, errorResponse } = require('../utils/responseHandler');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Search receiver by email or phone number
 */
const searchReceiver = async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return badRequestResponse(res, 'Please provide an email or phone number to search.');
    }

    const cleanQuery = searchQuery.trim();

    const [users] = await query(
      `SELECT id, full_name, email, phone, status 
       FROM users 
       WHERE (LOWER(email) = LOWER(?) OR phone = ?) AND id != ?`,
      [cleanQuery, cleanQuery, req.user.id]
    );

    if (!users || users.length === 0) {
      return notFoundResponse(res, 'No registered user found with the provided email or phone number.');
    }

    const receiver = users[0];

    if (receiver.status === 'suspended') {
      return badRequestResponse(res, 'This recipient account is currently suspended and cannot receive data.');
    }

    // Mask sensitive details
    const emailParts = receiver.email.split('@');
    const maskedEmail = emailParts[0].substring(0, 2) + '***@' + emailParts[1];
    const maskedPhone = receiver.phone.substring(0, 4) + '****' + receiver.phone.substring(receiver.phone.length - 2);

    return successResponse(res, {
      id: receiver.id,
      full_name: receiver.full_name,
      email: receiver.email,
      phone: receiver.phone,
      masked_email: maskedEmail,
      masked_phone: maskedPhone
    }, 'Recipient verified.');
  } catch (error) {
    console.error('Search Receiver Error:', error);
    return errorResponse(res, 'Failed to look up receiver.');
  }
};

/**
 * Transfer internet data to another registered user
 */
const transferData = async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, receiver_query, amount, note = '' } = req.body;
  const transferAmount = req.validatedAmount || parseFloat(amount);

  if (!transferAmount || transferAmount <= 0) {
    return badRequestResponse(res, 'Invalid data amount. Must be greater than 0.');
  }

  let connection = null;

  try {
    // Step 1: Identify receiver
    let receiver = null;

    if (receiver_id) {
      const [recRows] = await query('SELECT id, full_name, email, phone, status FROM users WHERE id = ?', [receiver_id]);
      if (recRows && recRows.length > 0) receiver = recRows[0];
    } else if (receiver_query) {
      const q = receiver_query.trim();
      const [recRows] = await query(
        'SELECT id, full_name, email, phone, status FROM users WHERE (LOWER(email) = LOWER(?) OR phone = ?) AND id != ?',
        [q, q, senderId]
      );
      if (recRows && recRows.length > 0) receiver = recRows[0];
    }

    if (!receiver) {
      return notFoundResponse(res, 'Receiver account not found.');
    }

    if (receiver.id === senderId) {
      return badRequestResponse(res, 'You cannot transfer data to your own account.');
    }

    if (receiver.status === 'suspended') {
      return badRequestResponse(res, 'The receiver account is suspended and cannot receive data transfers.');
    }

    // Step 2: Acquire transaction connection
    connection = await getTransactionConnection();
    await connection.beginTransaction();

    // Step 3: Check sender's current balance with lock
    const [senderRows] = await connection.execute(
      'SELECT id, available_data, full_name, email FROM users WHERE id = ? FOR UPDATE',
      [senderId]
    );

    if (!senderRows || senderRows.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Sender account not found.');
    }

    const currentSenderAvailable = parseFloat(senderRows[0].available_data || 0);

    if (currentSenderAvailable < transferAmount) {
      await connection.rollback();
      return badRequestResponse(res, `Insufficient data balance. Available: ${currentSenderAvailable.toFixed(2)} GB, Required: ${transferAmount.toFixed(2)} GB.`);
    }

    // Step 4: Deduct sender available balance safely
    const [senderUpdate] = await connection.execute(
      'UPDATE users SET available_data = available_data - ? WHERE id = ? AND available_data >= ?',
      [transferAmount, senderId, transferAmount]
    );

    if (senderUpdate.affectedRows === 0) {
      await connection.rollback();
      return badRequestResponse(res, 'Transfer failed due to concurrent balance change. Please try again.');
    }

    // Step 5: Credit receiver balance
    await connection.execute(
      'UPDATE users SET available_data = available_data + ?, total_data = total_data + ? WHERE id = ?',
      [transferAmount, transferAmount, receiver.id]
    );

    // Step 6: Create audit transaction records
    const trxCodeSender = `SN-TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trxCodeReceiver = `SN-TRX-${Date.now() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transferNote = note.trim() || `Data transfer to ${receiver.full_name}`;

    // Record sender entry
    await connection.execute(
      `INSERT INTO transactions (transaction_code, sender_id, receiver_id, type, amount, status, note)
       VALUES (?, ?, ?, 'transfer_sent', ?, 'completed', ?)`,
      [trxCodeSender, senderId, receiver.id, transferAmount, transferNote]
    );

    // Record receiver entry
    await connection.execute(
      `INSERT INTO transactions (transaction_code, sender_id, receiver_id, type, amount, status, note)
       VALUES (?, ?, ?, 'transfer_received', ?, 'completed', ?)`,
      [trxCodeReceiver, senderId, receiver.id, transferAmount, `Received data from ${senderRows[0].full_name}`]
    );

    // Step 7: Commit transaction
    await connection.commit();

    // Step 8: Send notifications (after successful commit)
    await createNotification({
      userId: senderId,
      title: 'Data Transfer Successful',
      message: `You sent ${transferAmount.toFixed(2)} GB to ${receiver.full_name} (${receiver.email}).`,
      type: 'transfer_success'
    });

    await createNotification({
      userId: receiver.id,
      title: 'Data Received!',
      message: `${senderRows[0].full_name} sent you ${transferAmount.toFixed(2)} GB of mobile internet data.`,
      type: 'transfer_received'
    });

    const newSenderBalance = currentSenderAvailable - transferAmount;

    return successResponse(res, {
      transaction_code: trxCodeSender,
      amount: transferAmount,
      receiver_name: receiver.full_name,
      receiver_email: receiver.email,
      remaining_available_data: Number(newSenderBalance.toFixed(2))
    }, `Successfully transferred ${transferAmount.toFixed(2)} GB to ${receiver.full_name}!`);
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rbErr) {}
    }
    console.error('Data Transfer Error:', error);
    return errorResponse(res, 'Data transfer failed. Please try again.');
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

module.exports = {
  searchReceiver,
  transferData
};
