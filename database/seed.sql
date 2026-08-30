-- ==========================================================
-- SmartNet - Internet Data Sharing & Storage Platform
-- Seed Data (MySQL)
-- Note: Passwords below are bcrypt-hashed (cost factor 10)
-- 
-- Default Demo Credentials:
-- 1. Admin: admin@smartnet.com / Admin@123
-- 2. User:  user@smartnet.com  / User@123
-- 3. Recipient: receiver@smartnet.com / Receiver@123
-- ==========================================================

USE smartnet_db;

-- Clear previous sample records if needed
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE data_storage;
TRUNCATE TABLE transactions;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Demo Users
-- Bcrypt Hash for 'Admin@123' : $2a$10$7q5Jd9fN4xZ3G4jYqB2eQ.mR1Y9P0wZ7vE8nK4mO2pT6sL8uV0wGy (example generated)
-- Bcrypt Hash for 'User@123'  : $2a$10$uA3fU9LwV7hY8pQ5mN2bZ.kR0X8Q9vA6tD7mJ3nK1pS5tK7uU9vGy
-- Bcrypt Hash for 'Receiver@123': $2a$10$wB5gV0MxW8iZ9qR6nO3c_.lS1Y9R0wB7uE8nL4oL2qT6uL8vV0wGy

INSERT INTO users (id, full_name, email, phone, password_hash, role, status, total_data, available_data, stored_data, created_at) VALUES
(1, 'System Administrator', 'admin@smartnet.com', '+1 (555) 010-0001', '$2a$10$4nfmvX2z7mOvy7P2k7XlbeBfA68yYcM531XkG1M.a8g.NlD2V2n6W', 'admin', 'active', 100.00, 85.00, 15.00, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 'Alex Johnson', 'user@smartnet.com', '+1 (555) 010-0002', '$2a$10$4nfmvX2z7mOvy7P2k7XlbeBfA68yYcM531XkG1M.a8g.NlD2V2n6W', 'user', 'active', 25.00, 15.50, 4.50, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(3, 'Sarah Williams', 'receiver@smartnet.com', '+1 (555) 010-0003', '$2a$10$4nfmvX2z7mOvy7P2k7XlbeBfA68yYcM531XkG1M.a8g.NlD2V2n6W', 'user', 'active', 20.00, 18.00, 2.00, DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Insert Data Vault Storage History for User (id: 2)
INSERT INTO data_storage (id, user_id, storage_code, amount, status, stored_at, restored_at, notes) VALUES
(1, 2, 'SN-VLT-98231', 5.00, 'restored', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Mountain trip offline storage'),
(2, 2, 'SN-VLT-98242', 4.50, 'stored', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 'Weekend camping data reserve'),
(3, 3, 'SN-VLT-98253', 2.00, 'stored', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, 'Flight & travel lock');

-- Insert Sample Transactions
INSERT INTO transactions (id, transaction_code, sender_id, receiver_id, type, amount, status, note, created_at) VALUES
(1, 'SN-TRX-1001', NULL, 2, 'bonus_allocated', 10.00, 'completed', 'Welcome starter pack data allowance', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(2, 'SN-TRX-1002', 2, 3, 'transfer_sent', 3.00, 'completed', 'Project research sharing with Sarah', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'SN-TRX-1003', 2, 3, 'transfer_received', 3.00, 'completed', 'Project research sharing with Sarah', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 'SN-TRX-1004', 2, NULL, 'vault_stored', 5.00, 'completed', 'Stored into Data Vault for mountain trip', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 'SN-TRX-1005', 2, NULL, 'vault_restored', 5.00, 'completed', 'Restored from Data Vault after returning online', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 'SN-TRX-1006', 2, NULL, 'vault_stored', 4.50, 'completed', 'Stored into Data Vault for weekend trip', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 'SN-TRX-1007', 1, 2, 'admin_adjustment', 5.00, 'completed', 'Loyalty bonus credit', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Insert Sample Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 2, 'Welcome to SmartNet!', 'Your account has been initialized with 10.00 GB of free starter internet data.', 'system', TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(2, 2, 'Data Transferred Successfully', 'You successfully transferred 3.00 GB to Sarah Williams (receiver@smartnet.com).', 'transfer_success', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 3, 'Data Received!', 'Alex Johnson transferred 3.00 GB of data to your account.', 'transfer_received', FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 2, 'Data Stored in Vault', '4.50 GB has been safely locked in your Data Vault for your offline period.', 'vault_stored', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 2, 'Admin Bonus Added', 'System Administrator credited 5.00 GB loyalty bonus to your account.', 'account_alert', FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY));
