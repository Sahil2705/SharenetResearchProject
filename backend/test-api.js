const app = require('./server');
const http = require('http');

async function testApi() {
  console.log('🧪 Starting SmartNet API Test Suite...');
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(5005, resolve));
  console.log('✅ Test server started on port 5005');

  const baseUrl = 'http://localhost:5005/api';

  async function request(endpoint, options = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const body = await res.json();
    return { status: res.status, body };
  }

  try {
    // 1. Health check
    console.log('\n--- Test 1: Health Check ---');
    const health = await request('/health');
    console.log('Health Status:', health.status, health.body.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. User Login (Alex Johnson)
    console.log('\n--- Test 2: User Login ---');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@smartnet.com', password: 'User@123' })
    });
    console.log('Login Status:', loginRes.status, loginRes.body.message);
    if (loginRes.status !== 200 || !loginRes.body.data.token) throw new Error('Login failed');
    const userToken = loginRes.body.data.token;
    const initialAvailable = loginRes.body.data.user.available_data;
    console.log(`Initial Available Balance: ${initialAvailable} GB`);

    // 3. User Dashboard
    console.log('\n--- Test 3: Get Dashboard Summary ---');
    const dashRes = await request('/dashboard', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Dashboard Status:', dashRes.status);
    console.log('Summary:', dashRes.body.data.summary);
    if (dashRes.status !== 200) throw new Error('Dashboard fetch failed');

    // 4. Recipient Search
    console.log('\n--- Test 4: Search Recipient ---');
    const searchRes = await request('/data/transfer/search?query=receiver@smartnet.com', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Search Status:', searchRes.status, searchRes.body.data.full_name);
    if (searchRes.status !== 200) throw new Error('Recipient search failed');
    const receiverId = searchRes.body.data.id;

    // 5. Transfer Data (Send 2.00 GB)
    console.log('\n--- Test 5: Transfer 2.00 GB Data ---');
    const transferRes = await request('/data/transfer/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ receiver_id: receiverId, amount: 2.0, note: 'Shared 2GB for test' })
    });
    console.log('Transfer Status:', transferRes.status, transferRes.body.message);
    if (transferRes.status !== 200) throw new Error('Transfer failed');

    // 6. Test Insufficient Balance Prevention
    console.log('\n--- Test 6: Test Negative/Excess Balance Prevention ---');
    const excessTransfer = await request('/data/transfer/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ receiver_id: receiverId, amount: 9999.0 })
    });
    console.log('Excess Transfer Status (Expected 400):', excessTransfer.status, excessTransfer.body.message);
    if (excessTransfer.status !== 400) throw new Error('Balance overdraft prevention failed');

    // 7. Data Vault Store (Store 3.00 GB)
    console.log('\n--- Test 7: Store 3.00 GB into Data Vault ---');
    const vaultStore = await request('/data/vault/store', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ amount: 3.0, notes: 'Camping trip offline buffer' })
    });
    console.log('Vault Store Status:', vaultStore.status, vaultStore.body.message);
    console.log('Vault Code:', vaultStore.body.data.storage_code);
    if (vaultStore.status !== 200) throw new Error('Vault store failed');

    // 8. Data Vault Restore (Restore 3.00 GB)
    console.log('\n--- Test 8: Restore Data from Data Vault ---');
    const vaultRestore = await request('/data/vault/restore', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ amount: 3.0 })
    });
    console.log('Vault Restore Status:', vaultRestore.status, vaultRestore.body.message);
    if (vaultRestore.status !== 200) throw new Error('Vault restore failed');

    // 9. Transaction History
    console.log('\n--- Test 9: Get Transaction History ---');
    const trxRes = await request('/data/transactions?page=1&limit=5', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Transactions Status:', trxRes.status);
    console.log(`Retrieved ${trxRes.body.data.transactions.length} transactions of total ${trxRes.body.data.pagination.total}`);
    if (trxRes.status !== 200) throw new Error('Transactions fetch failed');

    // 10. Notifications
    console.log('\n--- Test 10: Get Notifications & Mark Read ---');
    const notifRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Notifications Status:', notifRes.status, `Count: ${notifRes.body.data.notifications.length}`);
    const markAll = await request('/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Mark Read-all Status:', markAll.status, markAll.body.message);

    // 11. Admin Login & Stats
    console.log('\n--- Test 11: Admin Login & Platform Stats ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@smartnet.com', password: 'Admin@123' })
    });
    const adminToken = adminLogin.body.data.token;
    const statsRes = await request('/admin/statistics', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Admin Stats Status:', statsRes.status);
    console.log('Platform Stats:', statsRes.body.data);
    if (statsRes.status !== 200) throw new Error('Admin stats failed');

    console.log('\n🎉 ALL 11 BACKEND API TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

testApi();
