const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  multipleStatements: true,
};

async function initDatabase() {
  console.log('🔄 Connecting to MySQL server at', dbConfig.host + ':' + dbConfig.port + '...');
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server successfully.');

    const dbName = process.env.DATABASE_NAME || 'smartnet_db';
    console.log(`📦 Creating database "${dbName}" if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📄 Executing database schema from:', schemaPath);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Database tables created successfully.');

    // Compute live bcrypt hashes for demo accounts
    const salt = await bcrypt.genSalt(10);
    const adminPassHash = await bcrypt.hash('Admin@123', salt);
    const userPassHash = await bcrypt.hash('User@123', salt);
    const receiverPassHash = await bcrypt.hash('Receiver@123', salt);

    // Seed Demo Users with guaranteed fresh bcrypt hashes
    const insertUsersQuery = `
      INSERT INTO users (id, full_name, email, phone, password_hash, role, status, total_data, available_data, stored_data)
      VALUES 
      (1, 'System Administrator', 'admin@smartnet.com', '+1 (555) 010-0001', ?, 'admin', 'active', 100.00, 85.00, 15.00),
      (2, 'Alex Johnson', 'user@smartnet.com', '+1 (555) 010-0002', ?, 'user', 'active', 25.00, 15.50, 4.50),
      (3, 'Sarah Williams', 'receiver@smartnet.com', '+1 (555) 010-0003', ?, 'user', 'active', 20.00, 18.00, 2.00)
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        status = VALUES(status);
    `;
    await connection.execute(insertUsersQuery, [adminPassHash, userPassHash, receiverPassHash]);
    console.log('✅ Demo accounts seeded (Admin: admin@smartnet.com, User: user@smartnet.com, Receiver: receiver@smartnet.com).');

    // Run seed data for storage, transactions, and notifications
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Populating initial simulation activity and history...');
      // We skip user insert from seed.sql because we handled it above with exact fresh bcrypt hashes
    }

    console.log('🎉 SmartNet Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error('👉 Please make sure your MySQL server is running and credentials in backend/.env are correct.');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
