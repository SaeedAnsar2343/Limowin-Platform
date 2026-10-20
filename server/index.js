import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());

// Helper to read DB
function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return {};
  }
}

// Helper to write DB
function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// 1. SITE SETTINGS & CONFIG
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json({
    siteSettings: db.siteSettings || {},
    paymentGateways: db.paymentGateways || {},
    promotions: db.promotions || [],
    affiliateConfig: db.affiliateConfig || {},
    gameOverrides: db.gameOverrides || {}
  });
});

app.post('/api/settings', (req, res) => {
  const db = readDb();
  db.siteSettings = { ...db.siteSettings, ...req.body };
  writeDb(db);
  res.json({ success: true, siteSettings: db.siteSettings });
});

// 2. PAYMENT GATEWAYS CONFIG (Admin updateable)
app.post('/api/payments/config', (req, res) => {
  const db = readDb();
  db.paymentGateways = { ...db.paymentGateways, ...req.body };
  writeDb(db);
  res.json({ success: true, paymentGateways: db.paymentGateways });
});

// 3. PROMOTIONS
app.get('/api/promotions', (req, res) => {
  const db = readDb();
  res.json(db.promotions || []);
});

app.post('/api/promotions', (req, res) => {
  const db = readDb();
  const newPromo = {
    id: 'promo-' + Date.now(),
    title: req.body.title || 'New Promotion',
    subtitle: req.body.subtitle || '',
    code: req.body.code || 'PROMO' + Math.floor(100 + Math.random() * 900),
    bonusPercent: Number(req.body.bonusPercent) || 50,
    maxAmount: Number(req.body.maxAmount) || 1000,
    minDeposit: Number(req.body.minDeposit) || 10,
    turnover: Number(req.body.turnover) || 5,
    category: req.body.category || 'All Games',
    active: req.body.active !== false,
    badge: req.body.badge || 'HOT'
  };
  db.promotions = [newPromo, ...(db.promotions || [])];
  writeDb(db);
  res.json({ success: true, promotion: newPromo });
});

app.put('/api/promotions/:id', (req, res) => {
  const db = readDb();
  db.promotions = (db.promotions || []).map(p => p.id === req.params.id ? { ...p, ...req.body } : p);
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/promotions/:id', (req, res) => {
  const db = readDb();
  db.promotions = (db.promotions || []).filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// 4. GAME BONUSES & OVERRIDES
app.get('/api/games/overrides', (req, res) => {
  const db = readDb();
  res.json(db.gameOverrides || {});
});

app.post('/api/games/override', (req, res) => {
  const { gameId, bonusMultiplier, customRtp } = req.body;
  const db = readDb();
  if (!db.gameOverrides) db.gameOverrides = {};
  db.gameOverrides[gameId] = {
    bonusMultiplier: Number(bonusMultiplier) || 1.0,
    customRtp: customRtp ? Number(customRtp) : undefined
  };
  writeDb(db);
  res.json({ success: true, overrides: db.gameOverrides });
});

// 5. DEPOSITS
app.get('/api/deposits', (req, res) => {
  const db = readDb();
  res.json(db.depositRequests || []);
});

app.post('/api/deposits', (req, res) => {
  const db = readDb();
  const newDeposit = {
    id: 'dep-' + Date.now(),
    userId: req.body.userId || 'user-demo-1',
    userName: req.body.userName || 'Player',
    userEmail: req.body.userEmail || 'player@limowin.com',
    method: req.body.method || 'USDT TRC-20',
    amount: Number(req.body.amount) || 50,
    bonusAmount: Number(req.body.bonusAmount) || 0,
    txHash: req.body.txHash || 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  db.depositRequests = [newDeposit, ...(db.depositRequests || [])];
  writeDb(db);
  res.json({ success: true, deposit: newDeposit });
});

app.put('/api/deposits/:id/approve', (req, res) => {
  const db = readDb();
  let approvedDeposit = null;
  db.depositRequests = (db.depositRequests || []).map(d => {
    if (d.id === req.params.id) {
      approvedDeposit = { ...d, status: 'approved', approvedAt: new Date().toISOString() };
      return approvedDeposit;
    }
    return d;
  });

  // Credit user's wallet
  if (approvedDeposit) {
    db.users = (db.users || []).map(u => {
      if (u.id === approvedDeposit.userId || u.email === approvedDeposit.userEmail) {
        return {
          ...u,
          balance: Number(u.balance) + approvedDeposit.amount,
          bonusBalance: Number(u.bonusBalance) + (approvedDeposit.bonusAmount || 0),
          totalDeposited: Number(u.totalDeposited) + approvedDeposit.amount
        };
      }
      return u;
    });
  }

  writeDb(db);
  res.json({ success: true, deposit: approvedDeposit });
});

app.put('/api/deposits/:id/reject', (req, res) => {
  const db = readDb();
  db.depositRequests = (db.depositRequests || []).map(d => {
    if (d.id === req.params.id) {
      return { ...d, status: 'rejected', rejectReason: req.body.reason || 'Verification Failed', rejectedAt: new Date().toISOString() };
    }
    return d;
  });
  writeDb(db);
  res.json({ success: true });
});

// 6. WITHDRAWALS
app.get('/api/withdrawals', (req, res) => {
  const db = readDb();
  res.json(db.withdrawalRequests || []);
});

app.post('/api/withdrawals', (req, res) => {
  const db = readDb();
  const amount = Number(req.body.amount) || 50;
  const newWithdrawal = {
    id: 'wth-' + Date.now(),
    userId: req.body.userId || 'user-demo-1',
    userName: req.body.userName || 'Player',
    userEmail: req.body.userEmail || 'player@limowin.com',
    method: req.body.method || 'Bank Transfer',
    details: req.body.details || 'Default Account',
    amount: amount,
    fee: 0,
    netAmount: amount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Deduct from balance
  db.users = (db.users || []).map(u => {
    if (u.id === newWithdrawal.userId || u.email === newWithdrawal.userEmail) {
      return {
        ...u,
        balance: Math.max(0, Number(u.balance) - amount)
      };
    }
    return u;
  });

  db.withdrawalRequests = [newWithdrawal, ...(db.withdrawalRequests || [])];
  writeDb(db);
  res.json({ success: true, withdrawal: newWithdrawal });
});

app.put('/api/withdrawals/:id/approve', (req, res) => {
  const db = readDb();
  let approvedWth = null;
  db.withdrawalRequests = (db.withdrawalRequests || []).map(w => {
    if (w.id === req.params.id) {
      approvedWth = { ...w, status: 'approved', approvedAt: new Date().toISOString(), txRef: req.body.txRef || 'PAYOUT-' + Date.now() };
      return approvedWth;
    }
    return w;
  });

  if (approvedWth) {
    db.users = (db.users || []).map(u => {
      if (u.id === approvedWth.userId) {
        return {
          ...u,
          totalWithdrawn: Number(u.totalWithdrawn) + approvedWth.amount
        };
      }
      return u;
    });
  }

  writeDb(db);
  res.json({ success: true, withdrawal: approvedWth });
});

app.put('/api/withdrawals/:id/reject', (req, res) => {
  const db = readDb();
  let rejectedWth = null;
  db.withdrawalRequests = (db.withdrawalRequests || []).map(w => {
    if (w.id === req.params.id) {
      rejectedWth = { ...w, status: 'rejected', rejectReason: req.body.reason || 'Incorrect banking details', rejectedAt: new Date().toISOString() };
      return rejectedWth;
    }
    return w;
  });

  // Refund user balance
  if (rejectedWth) {
    db.users = (db.users || []).map(u => {
      if (u.id === rejectedWth.userId) {
        return {
          ...u,
          balance: Number(u.balance) + rejectedWth.amount
        };
      }
      return u;
    });
  }

  writeDb(db);
  res.json({ success: true });
});

// 7. USER MANAGEMENT
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json(db.users || []);
});

app.put('/api/users/:id/block', (req, res) => {
  const db = readDb();
  const { status } = req.body; // 'blocked' or 'active'
  db.users = (db.users || []).map(u => u.id === req.params.id ? { ...u, status: status || 'blocked' } : u);
  writeDb(db);
  res.json({ success: true });
});

app.put('/api/users/:id/balance', (req, res) => {
  const db = readDb();
  const { balance, bonusBalance } = req.body;
  db.users = (db.users || []).map(u => {
    if (u.id === req.params.id) {
      return {
        ...u,
        balance: balance !== undefined ? Number(balance) : u.balance,
        bonusBalance: bonusBalance !== undefined ? Number(bonusBalance) : u.bonusBalance
      };
    }
    return u;
  });
  writeDb(db);
  res.json({ success: true });
});

// 8. AUTHENTICATION (Google, Email, Password, Reset)
app.post('/api/auth/google', (req, res) => {
  const db = readDb();
  const { email, name, avatar } = req.body;
  let user = (db.users || []).find(u => u.email === email);

  if (!user) {
    user = {
      id: 'usr-' + Date.now(),
      name: name || 'Google Player',
      email: email,
      role: 'player',
      balance: 1000.00, // Sign-up starter balance!
      bonusBalance: 200.00,
      totalDeposited: 0,
      totalWithdrawn: 0,
      vipLevel: 'Bronze VIP',
      status: 'active',
      referralCode: 'LIMO-' + Math.floor(1000 + Math.random() * 9000),
      referredBy: req.body.ref || null,
      referralCount: 0,
      referralEarnings: 0,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      createdAt: new Date().toISOString()
    };
    db.users = [user, ...(db.users || [])];
    writeDb(db);
  }
  res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const db = readDb();
  const { email, password, name, referralCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existing = (db.users || []).find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name: name || email.split('@')[0],
    email: email,
    role: 'player',
    balance: 500.00, // Welcome gift
    bonusBalance: 100.00,
    totalDeposited: 0,
    totalWithdrawn: 0,
    vipLevel: 'Bronze VIP',
    status: 'active',
    referralCode: 'LIMO-' + Math.floor(1000 + Math.random() * 9000),
    referredBy: referralCode || null,
    referralCount: 0,
    referralEarnings: 0,
    createdAt: new Date().toISOString()
  };

  db.users = [newUser, ...(db.users || [])];
  writeDb(db);
  res.json({ success: true, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const db = readDb();
  const { email } = req.body;
  const user = (db.users || []).find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'This account has been suspended by Administration. Contact Support.' });
  }
  res.json({ success: true, user });
});

app.post('/api/auth/reset', (req, res) => {
  res.json({ success: true, message: 'Password reset link sent to your registered email address.' });
});

// 9. STATS
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const users = db.users || [];
  const deposits = db.depositRequests || [];
  const withdrawals = db.withdrawalRequests || [];

  const totalDeposited = deposits
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

  res.json({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalDeposited,
    totalWithdrawn,
    pendingDepositsCount,
    pendingWithdrawalsCount,
    grossGamingRevenue: Math.max(0, totalDeposited - totalWithdrawn),
    totalLiveBetsToday: 14280 + Math.floor(Math.random() * 500)
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Limowin API Server running cleanly on http://localhost:${PORT}`);
});
