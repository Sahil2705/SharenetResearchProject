const { query, getTransactionConnection } = require('../config/db');
const { successResponse, badRequestResponse, notFoundResponse, errorResponse } = require('../utils/responseHandler');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Store data in Data Vault (buffer before entering no-network zone)
 */
const storeData = async (req, res) => {
  const userId = req.user.id;
  const { amount, notes = '' } = req.body;
  const storeAmount = req.validatedAmount || parseFloat(amount);

  if (!storeAmount || storeAmount <= 0) {
    return badRequestResponse(res, 'Please provide a valid data amount to store.');
  }

  let connection = null;

  try {
    connection = await getTransactionConnection();
    await connection.beginTransaction();

    // Check user available balance
    const [userRows] = await connection.execute(
      'SELECT id, available_data, stored_data, full_name FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'User not found.');
    }

    const currentAvailable = parseFloat(userRows[0].available_data || 0);
    const currentStored = parseFloat(userRows[0].stored_data || 0);

    if (currentAvailable < storeAmount) {
      await connection.rollback();
      return badRequestResponse(res, `Insufficient available balance to store in vault. Available: ${currentAvailable.toFixed(2)} GB, Requested: ${storeAmount.toFixed(2)} GB.`);
    }

    // Move available -> stored
    await connection.execute(
      'UPDATE users SET available_data = available_data - ?, stored_data = stored_data + ? WHERE id = ?',
      [storeAmount, storeAmount, userId]
    );

    // Create Data Vault entry
    const storageCode = `SN-VLT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const storageNote = notes.trim() || 'Offline Buffer / No-Network Zone Lock';

    await connection.execute(
      `INSERT INTO data_storage (user_id, storage_code, amount, status, notes)
       VALUES (?, ?, ?, 'stored', ?)`,
      [userId, storageCode, storeAmount, storageNote]
    );

    // Create Transaction Record
    const trxCode = `SN-TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await connection.execute(
      `INSERT INTO transactions (transaction_code, sender_id, receiver_id, type, amount, status, note)
       VALUES (?, ?, NULL, 'vault_stored', ?, 'completed', ?)`,
      [trxCode, userId, storeAmount, `Stored in Data Vault: ${storageNote}`]
    );

    await connection.commit();

    // Create notification
    await createNotification({
      userId,
      title: 'Data Vault: Locked Successfully',
      message: `${storeAmount.toFixed(2)} GB has been safely moved to your Data Vault. Code: ${storageCode}`,
      type: 'vault_stored'
    });

    const newAvailable = currentAvailable - storeAmount;
    const newStored = currentStored + storeAmount;

    return successResponse(res, {
      storage_code: storageCode,
      stored_amount: storeAmount,
      available_data: Number(newAvailable.toFixed(2)),
      stored_data: Number(newStored.toFixed(2))
    }, `Successfully stored ${storeAmount.toFixed(2)} GB into your Data Vault.`);
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rbErr) {}
    }
    console.error('Vault Store Error:', error);
    return errorResponse(res, 'Failed to store data in vault.');
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

/**
 * Restore data from Data Vault back to available balance
 */
const restoreData = async (req, res) => {
  const userId = req.user.id;
  const { storage_id, amount } = req.body;

  let connection = null;

  try {
    connection = await getTransactionConnection();
    await connection.beginTransaction();

    const [userRows] = await connection.execute(
      'SELECT id, available_data, stored_data FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'User not found.');
    }

    const currentStored = parseFloat(userRows[0].stored_data || 0);
    const currentAvailable = parseFloat(userRows[0].available_data || 0);

    if (currentStored <= 0) {
      await connection.rollback();
      return badRequestResponse(res, 'You have no data currently stored in your Data Vault to restore.');
    }

    let restoreAmount = 0;
    let targetStorageId = null;

    if (storage_id) {
      // Restore specific storage record
      const [storageRows] = await connection.execute(
        'SELECT id, storage_code, amount, status FROM data_storage WHERE id = ? AND user_id = ? FOR UPDATE',
        [storage_id, userId]
      );

      if (!storageRows || storageRows.length === 0) {
        await connection.rollback();
        return notFoundResponse(res, 'Storage record not found.');
      }

      if (storageRows[0].status === 'restored') {
        await connection.rollback();
        return badRequestResponse(res, 'This data lock has already been restored.');
      }

      restoreAmount = parseFloat(storageRows[0].amount);
      targetStorageId = storageRows[0].id;

      // Mark this specific record as restored
      await connection.execute(
        'UPDATE data_storage SET status = \'restored\', restored_at = NOW() WHERE id = ?',
        [targetStorageId]
      );
    } else {
      // Restore specific amount or restore all
      const requestedAmt = parseFloat(amount);
      if (!isNaN(requestedAmt) && requestedAmt > 0) {
        if (requestedAmt > currentStored) {
          await connection.rollback();
          return badRequestResponse(res, `Requested restore amount (${requestedAmt.toFixed(2)} GB) exceeds stored vault balance (${currentStored.toFixed(2)} GB).`);
        }
        restoreAmount = requestedAmt;
      } else {
        restoreAmount = currentStored; // Restore everything
      }

      // Mark oldest active storage records as restored
      await connection.execute(
        'UPDATE data_storage SET status = \'restored\', restored_at = NOW() WHERE user_id = ? AND status = \'stored\'',
        [userId]
      );
    }

    // Move stored -> available
    await connection.execute(
      'UPDATE users SET available_data = available_data + ?, stored_data = stored_data - ? WHERE id = ?',
      [restoreAmount, restoreAmount, userId]
    );

    // Record transaction
    const trxCode = `SN-TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await connection.execute(
      `INSERT INTO transactions (transaction_code, sender_id, receiver_id, type, amount, status, note)
       VALUES (?, ?, NULL, 'vault_restored', ?, 'completed', 'Restored data from Data Vault to active connection')`,
      [trxCode, userId, restoreAmount]
    );

    await connection.commit();

    // Create notification
    await createNotification({
      userId,
      title: 'Data Vault: Restored Successfully',
      message: `${restoreAmount.toFixed(2)} GB has been restored to your active available data.`,
      type: 'vault_restored'
    });

    const newAvailable = currentAvailable + restoreAmount;
    const newStored = Math.max(0, currentStored - restoreAmount);

    return successResponse(res, {
      restored_amount: restoreAmount,
      available_data: Number(newAvailable.toFixed(2)),
      stored_data: Number(newStored.toFixed(2))
    }, `Successfully restored ${restoreAmount.toFixed(2)} GB from your Data Vault!`);
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rbErr) {}
    }
    console.error('Vault Restore Error:', error);
    return errorResponse(res, 'Failed to restore data from vault.');
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

/**
 * Get Data Vault storage history for user
 */
const getStorageHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await query(
      `SELECT id, storage_code, amount, status, stored_at, restored_at, notes
       FROM data_storage
       WHERE user_id = ?
       ORDER BY stored_at DESC`,
      [userId]
    );

    return successResponse(res, rows, 'Storage history retrieved.');
  } catch (error) {
    console.error('Get Storage History Error:', error);
    return errorResponse(res, 'Failed to retrieve storage history.');
  }
};

/**
 * Get complete Data Vault status overview
 */
const getVaultSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [userRows] = await query(
      'SELECT stored_data, available_data FROM users WHERE id = ?',
      [userId]
    );

    const [activeLocks] = await query(
      `SELECT id, storage_code, amount, stored_at, notes
       FROM data_storage
       WHERE user_id = ? AND status = 'stored'
       ORDER BY stored_at DESC`,
      [userId]
    );

    const [allHistory] = await query(
      `SELECT id, storage_code, amount, status, stored_at, restored_at, notes
       FROM data_storage
       WHERE user_id = ?
       ORDER BY stored_at DESC
       LIMIT 10`,
      [userId]
    );

    return successResponse(res, {
      stored_data: parseFloat(userRows[0]?.stored_data || 0),
      available_data: parseFloat(userRows[0]?.available_data || 0),
      activeLocks,
      history: allHistory
    });
  } catch (error) {
    console.error('Get Vault Summary Error:', error);
    return errorResponse(res, 'Failed to get vault summary.');
  }
};

module.exports = {
  storeData,
  restoreData,
  getStorageHistory,
  getVaultSummary
};
