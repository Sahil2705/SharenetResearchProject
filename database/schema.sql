-- ==========================================================
-- SmartNet - Internet Data Sharing & Storage Platform
-- Database Schema Definition (MySQL)
-- ==========================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS smartnet_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smartnet_db;

-- ----------------------------------------------------------
-- Table: users
-- Core user accounts with balances and authentication details
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'suspended') DEFAULT 'active',
    total_data DECIMAL(10, 2) NOT NULL DEFAULT 10.00 COMMENT 'Total lifetime/allocated data in GB',
    available_data DECIMAL(10, 2) NOT NULL DEFAULT 10.00 COMMENT 'Current ready-to-use data in GB',
    stored_data DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Data securely locked in Data Vault in GB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_phone (phone),
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: transactions
-- Comprehensive audit ledger for all transfers and vault operations
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(40) NOT NULL UNIQUE,
    sender_id INT NULL,
    receiver_id INT NULL,
    type ENUM('transfer_sent', 'transfer_received', 'vault_stored', 'vault_restored', 'bonus_allocated', 'admin_adjustment') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('completed', 'failed', 'pending') DEFAULT 'completed',
    note VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trx_sender (sender_id),
    INDEX idx_trx_receiver (receiver_id),
    INDEX idx_trx_type (type),
    INDEX idx_trx_status (status),
    INDEX idx_trx_created_at (created_at),
    CONSTRAINT fk_trx_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_trx_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: data_storage
-- Data Vault records for storing & restoring offline data buffers
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_storage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    storage_code VARCHAR(40) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('stored', 'restored') DEFAULT 'stored',
    stored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    restored_at TIMESTAMP NULL,
    notes VARCHAR(255) NULL,
    INDEX idx_storage_user (user_id),
    INDEX idx_storage_status (status),
    INDEX idx_storage_stored_at (stored_at),
    CONSTRAINT fk_storage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: notifications
-- Real-time alerts for transfers, storage, restorations, and alerts
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('transfer_success', 'transfer_received', 'vault_stored', 'vault_restored', 'account_alert', 'system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_is_read (is_read),
    INDEX idx_notif_created_at (created_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
