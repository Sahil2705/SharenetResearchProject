# SmartNet – Internet Data Sharing & Storage Platform

[![Vercel Compatible](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MySQL-blue?style=flat)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SmartNet** is a modern, production-grade web application platform that enables users to manage their unused mobile internet data by:
1. **Sharing data** seamlessly with other registered users in real-time.
2. **Storing unused data temporarily** in a personal **Data Vault** when traveling or entering offline/dead zones.
3. **Restoring and unlocking** the stored data immediately upon returning to network coverage.

> [!NOTE]
> **Simulation Disclaimer**: SmartNet is a software data management simulation system. All balances and transfers represent simulated data allowances with full ACID database transaction guarantees.

---

## 🌟 Key Features

### 1. Peer-to-Peer Data Transfer
- Search recipient by registered **email address** or **phone number**.
- Live identity verification preview with masked phone/email for safety.
- Atomic MySQL transactions (`START TRANSACTION`, `SELECT FOR UPDATE`, `COMMIT`/`ROLLBACK`) ensuring zero balance overdraft or double-spending.
- Real-time transaction receipt generation with unique code (`SN-TRX-XXXXXX`).

### 2. Offline Data Vault
- Safeguard unused data before entering offline zones (flights, subway systems, remote camping, hikes).
- One-click transfer from **Available Balance &rarr; Data Vault**.
- Instant single-click restoration from **Data Vault &rarr; Available Balance**.
- Comprehensive historical log of all storage and restoration timestamps.

### 3. Analytics & Dashboard
- Live visual metric cards: *Available Data*, *Vault Locked Data*, *Shared Data*, *Received Data*, *Total Lifetime Data*.
- Interactive visual distribution bars and 7-day activity volume trends.
- Quick Top-Up Console to credit simulated data (+5 GB, +10 GB, +25 GB) for continuous testing.

### 4. Immutable Ledger & Notifications
- Paginated, filterable, and searchable transaction history (Sent, Received, Stored, Restored, Bonuses).
- Real-time in-app notification center with unread counter badges.

### 5. Master Administrator Console
- System-wide statistics: total users, active vs. suspended accounts, total data transferred, total vaulted data.
- User management table with instant account suspension/reactivation toggles.
- Administrative balance adjustment tool (loyalty bonuses / adjustments).
- Global audit log of all operations across the platform.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, CSS3 Glassmorphism |
| **Backend** | Node.js, Express.js REST APIs |
| **Database** | MySQL (via `mysql2/promise` with connection pooling & transactions) |
| **Security** | `bcryptjs` password hashing, `jsonwebtoken` (JWT), parameterized SQL |
| **Deployment** | Vercel (Vite Frontend SPA + Serverless Node.js API Functions) |

---

## 🔑 Demo Credentials

| Role | Email | Password | Initial Balance |
|---|---|---|---|
| **Administrator** | `admin@smartnet.com` | `Admin@123` | 85.00 GB Available / 15.00 GB Vault |
| **Regular User** | `user@smartnet.com` | `User@123` | 15.50 GB Available / 4.50 GB Vault |
| **Recipient User** | `receiver@smartnet.com` | `Receiver@123` | 18.00 GB Available / 2.00 GB Vault |

*Note: The login page includes 1-click shortcut buttons to instantly autofill these demo accounts.*

---

## 🗄️ Database Design & Schema

The system uses 4 relational MySQL tables:

```
┌──────────────┐         1:N         ┌──────────────────┐
│    users     ├────────────────────<│   transactions   │
└──────┬───────┘                     └──────────────────┘
       │
       │ 1:N                         1:N
       ├────────────────────────────<┌──────────────────┐
       │                             │   data_storage   │
       │ 1:N                         └──────────────────┘
       └────────────────────────────<┌──────────────────┐
                                     │  notifications   │
                                     └──────────────────┘
```

### Table Definitions:
1. **`users`**: `id`, `full_name`, `email`, `phone`, `password_hash`, `role` (`user`\|`admin`), `status` (`active`\|`suspended`), `total_data`, `available_data`, `stored_data`, `created_at`, `updated_at`.
2. **`transactions`**: `id`, `transaction_code`, `sender_id`, `receiver_id`, `type` (`transfer_sent`, `transfer_received`, `vault_stored`, `vault_restored`, `bonus_allocated`, `admin_adjustment`), `amount`, `status`, `note`, `created_at`.
3. **`data_storage`**: `id`, `user_id`, `storage_code`, `amount`, `status` (`stored`\|`restored`), `stored_at`, `restored_at`, `notes`.
4. **`notifications`**: `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`.

---

## 🚀 Local Setup & Installation

### Prerequisites
- [Node.js (v18+)](https://nodejs.org)
- [MySQL Server (v8.0+)](https://dev.mysql.com/downloads/installer/) or XAMPP / MariaDB / Cloud MySQL (e.g., Aiven, PlanetScale, Railway)

### Step 1: Clone or Navigate to Project
```bash
cd smartnet
```

### Step 2: Configure Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
DATABASE_NAME=smartnet_db

JWT_SECRET=smartnet_super_secret_jwt_key_2026_production_grade
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Initialize Database (Tables & Demo Users)
```bash
cd backend
npm install
npm run db:init
```
*(Or import `database/schema.sql` and `database/seed.sql` in MySQL Workbench / phpMyAdmin).*

### Step 4: Run Backend Server
```bash
cd backend
npm start
# Server starts at http://localhost:5000
```

### Step 5: Run Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

---

## 🌐 Vercel Deployment Guide

SmartNet is engineered for **zero-configuration deployment on Vercel**.

### 1. Database in the Cloud
Deploy your MySQL database to any managed cloud provider such as:
- **Aiven for MySQL** (Free tier available)
- **Railway.app** (Free MySQL instance)
- **PlanetScale** / **DigitalOcean**

### 2. Vercel Project Setup
1. Push this repository to GitHub/GitLab.
2. Import the repository into **[Vercel Dashboard](https://vercel.com)**.
3. Configure the **Environment Variables** in Vercel Project Settings:
   - `DATABASE_HOST` = `<your-cloud-mysql-host>`
   - `DATABASE_PORT` = `3306`
   - `DATABASE_USER` = `<your-db-user>`
   - `DATABASE_PASSWORD` = `<your-db-password>`
   - `DATABASE_NAME` = `smartnet_db`
   - `JWT_SECRET` = `<a-random-secure-string>`
   - `VITE_API_URL` = `/api`
4. Click **Deploy**. Vercel will automatically build the static React frontend into `dist` and route `/api/*` requests to the serverless function in `api/index.js`.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create user with 10 GB starter allowance
- `POST /api/auth/login` - Authenticate user & return JWT
- `GET /api/auth/profile` - Get authenticated profile & balances
- `PUT /api/auth/profile` - Update full name & phone number
- `PUT /api/auth/change-password` - Change account password
- `POST /api/auth/topup` - Credit simulated data balance (+5, +10, +25 GB)

### Dashboard & Transfers
- `GET /api/dashboard` - Retrieve aggregated balances, trends & recent activities
- `GET /api/data/transfer/search?query=...` - Lookup receiver by email or phone
- `POST /api/data/transfer/send` - Execute atomic data transfer

### Data Vault
- `GET /api/data/vault/summary` - Get vault locks and total locked balance
- `GET /api/data/vault/history` - Retrieve storage & restoration history
- `POST /api/data/vault/store` - Lock data in Data Vault
- `POST /api/data/vault/restore` - Restore locked data to active balance

### Transactions & Notifications
- `GET /api/data/transactions` - Filtered & paginated transaction ledger
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark single notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### Administrator Panel
- `GET /api/admin/statistics` - Platform-wide volume & user counts
- `GET /api/admin/users` - Paginated user management list
- `PATCH /api/admin/users/:id/status` - Suspend or activate user
- `POST /api/admin/users/:id/adjust-balance` - Credit or deduct user data balance
- `GET /api/admin/transactions` - Global audit log

---

## 📄 License
This project is licensed under the MIT License.
