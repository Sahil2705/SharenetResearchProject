const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'smartnet_db',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};


let pool = null;
let isConnected = false;

// In-memory fallback database for local environments without an active MySQL server
let inMemoryStore = null;

function initInMemoryStore() {
  const defaultHash = bcrypt.hashSync('User@123', 10);
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const receiverHash = bcrypt.hashSync('Receiver@123', 10);

  inMemoryStore = {
    users: [
      {
        id: 1,
        full_name: 'System Administrator',
        email: 'admin@smartnet.com',
        phone: '+1 (555) 010-0001',
        password_hash: adminHash,
        role: 'admin',
        status: 'active',
        total_data: 100.0,
        available_data: 85.0,
        stored_data: 15.0,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        full_name: 'Alex Johnson',
        email: 'user@smartnet.com',
        phone: '+1 (555) 010-0002',
        password_hash: defaultHash,
        role: 'user',
        status: 'active',
        total_data: 25.0,
        available_data: 15.5,
        stored_data: 4.5,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        full_name: 'Sarah Williams',
        email: 'receiver@smartnet.com',
        phone: '+1 (555) 010-0003',
        password_hash: receiverHash,
        role: 'user',
        status: 'active',
        total_data: 20.0,
        available_data: 18.0,
        stored_data: 2.0,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    transactions: [
      {
        id: 1,
        transaction_code: 'SN-TRX-1001',
        sender_id: null,
        receiver_id: 2,
        type: 'bonus_allocated',
        amount: 10.0,
        status: 'completed',
        note: 'Welcome starter pack data allowance',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 2,
        transaction_code: 'SN-TRX-1002',
        sender_id: 2,
        receiver_id: 3,
        type: 'transfer_sent',
        amount: 3.0,
        status: 'completed',
        note: 'Project research sharing with Sarah',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 3,
        transaction_code: 'SN-TRX-1003',
        sender_id: 2,
        receiver_id: 3,
        type: 'transfer_received',
        amount: 3.0,
        status: 'completed',
        note: 'Project research sharing with Sarah',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 4,
        transaction_code: 'SN-TRX-1004',
        sender_id: 2,
        receiver_id: null,
        type: 'vault_stored',
        amount: 5.0,
        status: 'completed',
        note: 'Stored into Data Vault for mountain trip',
        created_at: new Date(Date.now() - 6 * 86400000).toISOString()
      },
      {
        id: 5,
        transaction_code: 'SN-TRX-1005',
        sender_id: 2,
        receiver_id: null,
        type: 'vault_restored',
        amount: 5.0,
        status: 'completed',
        note: 'Restored from Data Vault after returning online',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 6,
        transaction_code: 'SN-TRX-1006',
        sender_id: 2,
        receiver_id: null,
        type: 'vault_stored',
        amount: 4.5,
        status: 'completed',
        note: 'Stored into Data Vault for weekend trip',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    data_storage: [
      {
        id: 1,
        user_id: 2,
        storage_code: 'SN-VLT-98231',
        amount: 5.0,
        status: 'restored',
        stored_at: new Date(Date.now() - 6 * 86400000).toISOString(),
        restored_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        notes: 'Mountain trip offline storage'
      },
      {
        id: 2,
        user_id: 2,
        storage_code: 'SN-VLT-98242',
        amount: 4.5,
        status: 'stored',
        stored_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        restored_at: null,
        notes: 'Weekend camping data reserve'
      },
      {
        id: 3,
        user_id: 3,
        storage_code: 'SN-VLT-98253',
        amount: 2.0,
        status: 'stored',
        stored_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        restored_at: null,
        notes: 'Flight & travel lock'
      }
    ],
    notifications: [
      {
        id: 1,
        user_id: 2,
        title: 'Welcome to SmartNet!',
        message: 'Your account has been initialized with 10.00 GB of free starter internet data.',
        type: 'system',
        is_read: 1,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 2,
        user_id: 2,
        title: 'Data Transferred Successfully',
        message: 'You successfully transferred 3.00 GB to Sarah Williams (receiver@smartnet.com).',
        type: 'transfer_success',
        is_read: 1,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 3,
        user_id: 3,
        title: 'Data Received!',
        message: 'Alex Johnson transferred 3.00 GB of data to your account.',
        type: 'transfer_received',
        is_read: 0,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 4,
        user_id: 2,
        title: 'Data Stored in Vault',
        message: '4.50 GB has been safely locked in your Data Vault for your offline period.',
        type: 'vault_stored',
        is_read: 0,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 5,
        user_id: 2,
        title: 'Admin Bonus Added',
        message: 'System Administrator credited 5.00 GB loyalty bonus to your account.',
        type: 'account_alert',
        is_read: 0,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ]
  };
}

function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (err) {
      console.warn('MySQL pool creation failed:', err.message);
    }
  }
  return pool;
}

// Universal query runner with MySQL connection check
async function query(sql, params = []) {
  const p = getPool();
  if (p) {
    try {
      const [results] = await p.execute(sql, params);
      isConnected = true;
      return [results];
    } catch (err) {
      // If table or db does not exist, access is denied, or connection refused, fallback gracefully
      const isConnectionError = [
        'ECONNREFUSED',
        'ER_BAD_DB_ERROR',
        'ER_NO_SUCH_TABLE',
        'ER_ACCESS_DENIED_ERROR',
        'ENOTFOUND',
        'ETIMEDOUT',
        'PROTOCOL_CONNECTION_LOST'
      ].includes(err.code);

      if (isConnectionError) {
        if (!inMemoryStore) {
          console.warn(`⚠️ MySQL (${err.code}: ${err.message}). Using built-in local store fallback.`);
          initInMemoryStore();
        }
        return executeMockQuery(sql, params);
      }
      throw err;
    }
  }

  if (!inMemoryStore) initInMemoryStore();
  return executeMockQuery(sql, params);
}

// Universal transaction helper
async function getTransactionConnection() {
  const p = getPool();
  if (p) {
    try {
      const connection = await p.getConnection();
      return connection;
    } catch (err) {
      const isConnectionError = [
        'ECONNREFUSED',
        'ER_BAD_DB_ERROR',
        'ER_NO_SUCH_TABLE',
        'ER_ACCESS_DENIED_ERROR',
        'ENOTFOUND',
        'ETIMEDOUT',
        'PROTOCOL_CONNECTION_LOST'
      ].includes(err.code);

      if (isConnectionError) {
        if (!inMemoryStore) initInMemoryStore();
        return createMockConnection();
      }
      throw err;
    }
  }
  if (!inMemoryStore) initInMemoryStore();
  return createMockConnection();
}

// Fallback executor for zero-dependency development/demo runs
function executeMockQuery(sql, params = []) {
  if (!inMemoryStore) initInMemoryStore();
  const trimmed = sql.trim().toUpperCase();

  // Handle SELECT users by email or phone or id
  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM USERS')) {
    if (trimmed.includes('WHERE EMAIL = ? OR PHONE = ?')) {
      const u = inMemoryStore.users.find(x => (x.email === params[0] || x.phone === params[1]));
      return [u ? [u] : []];
    }
    if (trimmed.includes('WHERE EMAIL = ?')) {
      const u = inMemoryStore.users.find(x => x.email === params[0]);
      return [u ? [u] : []];
    }
    if (trimmed.includes('WHERE PHONE = ?')) {
      const u = inMemoryStore.users.find(x => x.phone === params[0]);
      return [u ? [u] : []];
    }
    if (trimmed.includes('WHERE ID = ?')) {
      const u = inMemoryStore.users.find(x => Number(x.id) === Number(params[0]));
      return [u ? [u] : []];
    }
    return [[...inMemoryStore.users]];
  }

  // Handle INSERT INTO users
  if (trimmed.startsWith('INSERT INTO USERS')) {
    const newId = inMemoryStore.users.length ? Math.max(...inMemoryStore.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      full_name: params[0],
      email: params[1],
      phone: params[2],
      password_hash: params[3],
      role: params[4] || 'user',
      status: 'active',
      total_data: parseFloat(params[5] || 10.0),
      available_data: parseFloat(params[6] || 10.0),
      stored_data: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryStore.users.push(newUser);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // Handle UPDATE users
  if (trimmed.startsWith('UPDATE USERS')) {
    if (trimmed.includes('AVAILABLE_DATA = AVAILABLE_DATA - ?, STORED_DATA = STORED_DATA + ? WHERE ID = ?')) {
      const amt = parseFloat(params[0]);
      const uid = Number(params[2]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.available_data = Math.max(0, u.available_data - amt);
        u.stored_data = u.stored_data + amt;
        return [{ affectedRows: 1 }];
      }
    }
    if (trimmed.includes('AVAILABLE_DATA = AVAILABLE_DATA + ?, STORED_DATA = STORED_DATA - ? WHERE ID = ?')) {
      const amt = parseFloat(params[0]);
      const uid = Number(params[2]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.available_data = u.available_data + amt;
        u.stored_data = Math.max(0, u.stored_data - amt);
        return [{ affectedRows: 1 }];
      }
    }
    if (trimmed.includes('AVAILABLE_DATA = AVAILABLE_DATA - ? WHERE ID = ?')) {
      const amt = parseFloat(params[0]);
      const uid = Number(params[1]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.available_data = Math.max(0, u.available_data - amt);
        return [{ affectedRows: 1 }];
      }
    }
    if (trimmed.includes('AVAILABLE_DATA = AVAILABLE_DATA + ?, TOTAL_DATA = TOTAL_DATA + ? WHERE ID = ?')) {
      const amt = parseFloat(params[0]);
      const uid = Number(params[2]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.available_data = u.available_data + amt;
        u.total_data = u.total_data + amt;
        return [{ affectedRows: 1 }];
      }
    }
    if (trimmed.includes('AVAILABLE_DATA = AVAILABLE_DATA + ? WHERE ID = ?')) {
      const amt = parseFloat(params[0]);
      const uid = Number(params[1]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.available_data = u.available_data + amt;
        return [{ affectedRows: 1 }];
      }
    }
    if (trimmed.includes('STATUS = ? WHERE ID = ?')) {
      const status = params[0];
      const uid = Number(params[1]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.status = status;
        return [{ affectedRows: 1 }];
      }
    }
    if (trimmed.includes('PASSWORD_HASH = ? WHERE ID = ?')) {
      const hash = params[0];
      const uid = Number(params[1]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.password_hash = hash;
        return [{ affectedRows: 1 }];
      }
    }
    if (trimmed.includes('FULL_NAME = ?, PHONE = ? WHERE ID = ?')) {
      const name = params[0];
      const phone = params[1];
      const uid = Number(params[2]);
      const u = inMemoryStore.users.find(x => x.id === uid);
      if (u) {
        u.full_name = name;
        u.phone = phone;
        return [{ affectedRows: 1 }];
      }
    }
    return [{ affectedRows: 1 }];
  }

  // Handle transactions insert
  if (trimmed.startsWith('INSERT INTO TRANSACTIONS')) {
    const newId = inMemoryStore.transactions.length ? Math.max(...inMemoryStore.transactions.map(t => t.id)) + 1 : 1;
    const trx = {
      id: newId,
      transaction_code: params[0],
      sender_id: params[1] !== undefined ? params[1] : null,
      receiver_id: params[2] !== undefined ? params[2] : null,
      type: params[3],
      amount: parseFloat(params[4]),
      status: params[5] || 'completed',
      note: params[6] || null,
      created_at: new Date().toISOString()
    };
    inMemoryStore.transactions.unshift(trx);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // Handle Aggregate stats
  if (trimmed.includes('COUNT(ID) AS TOTAL_USERS FROM USERS')) {
    return [[{ total_users: inMemoryStore.users.length }]];
  }
  if (trimmed.includes('COUNT(ID) AS ACTIVE_USERS FROM USERS')) {
    return [[{ active_users: inMemoryStore.users.filter(u => u.status === 'active').length }]];
  }
  if (trimmed.includes('COUNT(ID) AS SUSPENDED_USERS FROM USERS')) {
    return [[{ suspended_users: inMemoryStore.users.filter(u => u.status === 'suspended').length }]];
  }
  if (trimmed.includes('SUM(TOTAL_DATA) AS PLATFORM_TOTAL_DATA')) {
    const tot = inMemoryStore.users.reduce((acc, u) => acc + (parseFloat(u.total_data) || 0), 0);
    const avail = inMemoryStore.users.reduce((acc, u) => acc + (parseFloat(u.available_data) || 0), 0);
    const stor = inMemoryStore.users.reduce((acc, u) => acc + (parseFloat(u.stored_data) || 0), 0);
    return [[{ platform_total_data: tot, platform_available_data: avail, platform_stored_data: stor }]];
  }
  if (trimmed.includes('SUM(AMOUNT) AS TOTAL_TRANSFERRED')) {
    const transfers = inMemoryStore.transactions.filter(t => t.type === 'transfer_sent' && t.status === 'completed');
    const tot = transfers.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    return [[{ total_transferred: tot, transfer_count: transfers.length }]];
  }
  if (trimmed.includes('SUM(AMOUNT) AS TOTAL_VAULT_LOCKED')) {
    const locked = inMemoryStore.data_storage.filter(d => d.status === 'stored');
    const tot = locked.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
    return [[{ total_vault_locked: tot }]];
  }
  if (trimmed.includes('COUNT(ID) AS TOTAL_TRANSACTIONS FROM TRANSACTIONS')) {
    return [[{ total_transactions: inMemoryStore.transactions.length }]];
  }
  if (trimmed.includes('SUM(AMOUNT) AS TOTAL_SENT') && trimmed.includes('TYPE = \'TRANSFER_SENT\'')) {
    const uid = params[0];
    const sents = inMemoryStore.transactions.filter(t => t.sender_id === uid && t.type === 'transfer_sent' && t.status === 'completed');
    const tot = sents.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    return [[{ total_sent: tot, count_sent: sents.length }]];
  }
  if (trimmed.includes('SUM(AMOUNT) AS TOTAL_RECEIVED') && trimmed.includes('TYPE = \'TRANSFER_RECEIVED\'')) {
    const uid = params[0];
    const recs = inMemoryStore.transactions.filter(t => (t.receiver_id === uid && (t.type === 'transfer_received' || t.type === 'bonus_allocated')) && t.status === 'completed');
    const tot = recs.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    return [[{ total_received: tot, count_received: recs.length }]];
  }
  if (trimmed.includes('COUNT(ID) AS UNREAD_COUNT FROM NOTIFICATIONS')) {
    const uid = params[0];
    const unread = inMemoryStore.notifications.filter(n => n.user_id === uid && !n.is_read).length;
    return [[{ unread_count: unread }]];
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM TRANSACTIONS')) {
    let list = inMemoryStore.transactions.map(t => {
      const sender = inMemoryStore.users.find(u => u.id === t.sender_id);
      const receiver = inMemoryStore.users.find(u => u.id === t.receiver_id);
      return {
        ...t,
        sender_name: sender ? sender.full_name : null,
        sender_email: sender ? sender.email : null,
        receiver_name: receiver ? receiver.full_name : null,
        receiver_email: receiver ? receiver.email : null
      };
    });

    if (params.length > 0 && typeof params[0] === 'number') {
      const uid = params[0];
      list = list.filter(t => t.sender_id === uid || t.receiver_id === uid);
    }
    return [list];
  }

  // Handle data_storage
  if (trimmed.startsWith('INSERT INTO DATA_STORAGE')) {
    const newId = inMemoryStore.data_storage.length ? Math.max(...inMemoryStore.data_storage.map(d => d.id)) + 1 : 1;
    const ds = {
      id: newId,
      user_id: Number(params[0]),
      storage_code: params[1],
      amount: parseFloat(params[2]),
      status: 'stored',
      stored_at: new Date().toISOString(),
      restored_at: null,
      notes: params[3] || null
    };
    inMemoryStore.data_storage.unshift(ds);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  if (trimmed.startsWith('UPDATE DATA_STORAGE')) {
    if (trimmed.includes('STATUS = \'RESTORED\'') || trimmed.includes('STATUS = ?')) {
      const uid = Number(params[params.length - 1]);
      const rec = inMemoryStore.data_storage.find(d => d.user_id === uid && d.status === 'stored');
      if (rec) {
        rec.status = 'restored';
        rec.restored_at = new Date().toISOString();
        return [{ affectedRows: 1 }];
      }
    }
    return [{ affectedRows: 1 }];
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM DATA_STORAGE')) {
    let list = inMemoryStore.data_storage;
    if (params.length > 0) {
      list = list.filter(d => d.user_id === Number(params[0]));
    }
    return [list];
  }

  // Handle notifications
  if (trimmed.startsWith('INSERT INTO NOTIFICATIONS')) {
    const newId = inMemoryStore.notifications.length ? Math.max(...inMemoryStore.notifications.map(n => n.id)) + 1 : 1;
    const notif = {
      id: newId,
      user_id: Number(params[0]),
      title: params[1],
      message: params[2],
      type: params[3] || 'system',
      is_read: 0,
      created_at: new Date().toISOString()
    };
    inMemoryStore.notifications.unshift(notif);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM NOTIFICATIONS')) {
    let list = inMemoryStore.notifications;
    if (params.length > 0) {
      list = list.filter(n => n.user_id === Number(params[0]));
    }
    return [list];
  }

  if (trimmed.startsWith('UPDATE NOTIFICATIONS')) {
    if (trimmed.includes('IS_READ = TRUE') || trimmed.includes('IS_READ = 1')) {
      if (params.length === 1) {
        // user_id
        const uid = Number(params[0]);
        inMemoryStore.notifications.forEach(n => {
          if (n.user_id === uid) n.is_read = 1;
        });
      } else if (params.length === 2) {
        const notifId = Number(params[0]);
        const uid = Number(params[1]);
        const n = inMemoryStore.notifications.find(x => x.id === notifId && x.user_id === uid);
        if (n) n.is_read = 1;
      }
      return [{ affectedRows: 1 }];
    }
  }

  return [[]];
}

function createMockConnection() {
  return {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, params) => executeMockQuery(sql, params),
    query: async (sql, params) => executeMockQuery(sql, params)
  };
}

module.exports = {
  query,
  getTransactionConnection,
  getPool,
  dbConfig,
  get isConnected() { return isConnected; }
};
