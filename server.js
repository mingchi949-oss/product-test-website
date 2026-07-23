// ============================================
// MING COFFEE - Backend Server
// ============================================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Configuration
const botToken = "8749837452:AAF_TCGDTvgK4bLXBIoM4eQLjxv27Rxcksw";
const chatId = "-5249856765";
const bot = new TelegramBot(botToken);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize SQLite Database
const db = new sqlite3.Database('./ming_coffee.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables
db.serialize(() => {
  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    telegram_order_number TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    comment TEXT,
    items TEXT NOT NULL,
    total_cost REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    date TEXT
  )`);

  // Products table (for future admin management)
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    image_url TEXT,
    available INTEGER DEFAULT 1
  )`);

  // Order counters table
  db.run(`CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  )`);

  // Initialize counters if they don't exist
  db.run(`INSERT OR IGNORE INTO counters (name, value) VALUES ('order_count', 0)`);
  db.run(`INSERT OR IGNORE INTO counters (name, value) VALUES ('telegram_order_count', 0)`);
});

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MING Coffee Backend is running' });
});

// Get all orders (for admin)
app.get('/api/orders', (req, res) => {
  const status = req.query.status;
  
  let query = 'SELECT * FROM orders';
  let params = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY timestamp DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.json({ error: err.message });
      return;
    }
    
    // Parse items JSON for each order
    const orders = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
    
    res.json({ orders });
  });
});

// Get single order by ID
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
    if (err) {
      res.json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.json({ error: 'Order not found' });
      return;
    }
    
    res.json({
      ...row,
      items: JSON.parse(row.items)
    });
  });
});

// Get order by order number
app.get('/api/orders/number/:orderNumber', (req, res) => {
  const orderNumber = req.params.orderNumber;
  
  db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber], (err, row) => {
    if (err) {
      res.json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.json({ error: 'Order not found' });
      return;
    }
    
    res.json({
      ...row,
      items: JSON.parse(row.items)
    });
  });
});

// Create new order
app.post('/api/orders', async (req, res) => {
  const { phone, location, comment, items, totalCost } = req.body;
  
  if (!phone || !location || !items || !totalCost) {
    res.json({ error: 'Missing required fields' });
    return;
  }
  
  try {
    // Generate order numbers
    const orderNumber = await generateOrderNumber();
    const telegramOrderNumber = await generateTelegramOrderNumber();
    
    const date = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Save to database
    db.run(
      `INSERT INTO orders (order_number, telegram_order_number, phone, location, comment, items, total_cost, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, telegramOrderNumber, phone, location, comment || '', JSON.stringify(items), totalCost, date],
      function(err) {
        if (err) {
          res.json({ error: err.message });
          return;
        }
        
        const orderId = this.lastID;
        
        // Send to Telegram
        sendOrderToTelegram(telegramOrderNumber, phone, location, comment, items, totalCost);
        
        res.json({
          success: true,
          orderId: orderId,
          orderNumber: orderNumber,
          telegramOrderNumber: telegramOrderNumber
        });
      }
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    res.json({ error: 'Status is required' });
    return;
  }
  
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, orderId],
    function(err) {
      if (err) {
        res.json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.json({ error: 'Order not found' });
        return;
      }
      
      res.json({ success: true, message: 'Order status updated' });
    }
  );
});

// Confirm order (send confirmation to customer)
app.post('/api/orders/:id/confirm', async (req, res) => {
  const orderId = req.params.id;
  
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], async (err, order) => {
    if (err) {
      res.json({ error: err.message });
      return;
    }
    
    if (!order) {
      res.json({ error: 'Order not found' });
      return;
    }
    
    // Update status to confirmed
    db.run('UPDATE orders SET status = ? WHERE id = ?', ['confirmed', orderId], (err) => {
      if (err) {
        res.json({ error: err.message });
        return;
      }
      
      res.json({ success: true, message: 'Order confirmed' });
    });
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.get('SELECT COUNT(*) as total FROM orders', (err, totalRow) => {
    if (err) {
      res.json({ error: err.message });
      return;
    }
    
    db.get('SELECT COUNT(*) as today FROM orders WHERE date LIKE ?', [`%${today}%`], (err, todayRow) => {
      if (err) {
        res.json({ error: err.message });
        return;
      }
      
      db.get('SELECT SUM(total_cost) as revenue FROM orders WHERE status != "cancelled"', (err, revenueRow) => {
        if (err) {
          res.json({ error: err.message });
          return;
        }
        
        db.get('SELECT COUNT(*) as pending FROM orders WHERE status = "pending"', (err, pendingRow) => {
          if (err) {
            res.json({ error: err.message });
            return;
          }
          
          res.json({
            totalOrders: totalRow.total,
            todayOrders: todayRow.today,
            totalRevenue: revenueRow.revenue || 0,
            pendingOrders: pendingRow.pending
          });
        });
      });
    });
  });
});

// ============================================
// Helper Functions
// ============================================

function generateOrderNumber() {
  return new Promise((resolve, reject) => {
    db.run('UPDATE counters SET value = value + 1 WHERE name = "order_count"', function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      db.get('SELECT value FROM counters WHERE name = "order_count"', (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(`#${row.value}`);
      });
    });
  });
}

function generateTelegramOrderNumber() {
  return new Promise((resolve, reject) => {
    db.run('UPDATE counters SET value = value + 1 WHERE name = "telegram_order_count"', function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      db.get('SELECT value FROM counters WHERE name = "telegram_order_count"', (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(`#${row.value}`);
      });
    });
  });
}

function sendOrderToTelegram(orderNumber, phone, location, comment, items, totalCost) {
  const itemsText = items.map(item => 
    `☕ ${item.qty}x ${item.name} (${item.size || "L"}) (${item.sugar || "100%"}) - $${(item.price * item.qty).toFixed(2)}`
  ).join('\n');
  
  const message =
    `*📱 NEW ORDER RECEIVED*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Order Number:* ${orderNumber}\n` +
    `📞 *Phone:* ${phone}\n` +
    `📍 *Location:* ${location}\n` +
    `💬 *Comment:* ${comment || "None"}\n\n` +
    `*🛍️ ORDER ITEMS*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `${itemsText}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *TOTAL BILL:* $${totalCost.toFixed(2)}\n` +
    `⏰ *STATUS:* ⏳ Pending Confirmation\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Use /confirm_${phone.replace(/\D/g, "")} to confirm this order`;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' }).catch(err => {
    console.error('Error sending Telegram message:', err);
  });
}

// ============================================
// Telegram Bot Commands
// ============================================

// Set webhook for Telegram bot
bot.setWebHook(`https://${process.env.HOST || 'localhost'}:${PORT}/bot${botToken}`).catch(err => {
  console.error('Error setting webhook:', err);
});

// Handle Telegram commands
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (text === '/start') {
    bot.sendMessage(chatId, 
      '☕ Welcome to MING Coffee Admin Bot!\n\n' +
      'Commands:\n' +
      '/orders - View all orders\n' +
      '/pending - View pending orders\n' +
      '/stats - View statistics\n' +
      '/confirm_<phone> - Confirm an order'
    );
  } else if (text === '/orders') {
    db.all('SELECT * FROM orders ORDER BY timestamp DESC LIMIT 10', (err, rows) => {
      if (err || rows.length === 0) {
        bot.sendMessage(chatId, 'No orders found');
        return;
      }
      
      let message = '📋 *Recent Orders:*\n\n';
      rows.forEach(order => {
        message += `🔖 ${order.order_number} - ${order.phone}\n`;
        message += `   💰 $${order.total_cost.toFixed(2)} - ${order.status}\n\n`;
      });
      
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    });
  } else if (text === '/pending') {
    db.all('SELECT * FROM orders WHERE status = "pending" ORDER BY timestamp DESC', (err, rows) => {
      if (err || rows.length === 0) {
        bot.sendMessage(chatId, 'No pending orders');
        return;
      }
      
      let message = '⏳ *Pending Orders:*\n\n';
      rows.forEach(order => {
        message += `🔖 ${order.order_number} - ${order.phone}\n`;
        message += `   💰 $${order.total_cost.toFixed(2)}\n\n`;
      });
      
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    });
  } else if (text === '/stats') {
    db.get('SELECT COUNT(*) as total FROM orders', (err, totalRow) => {
      db.get('SELECT SUM(total_cost) as revenue FROM orders WHERE status != "cancelled"', (err, revenueRow) => {
        db.get('SELECT COUNT(*) as pending FROM orders WHERE status = "pending"', (err, pendingRow) => {
          const message = 
            `📊 *Statistics:*\n\n` +
            `📦 Total Orders: ${totalRow.total}\n` +
            `💰 Total Revenue: $${(revenueRow.revenue || 0).toFixed(2)}\n` +
            `⏳ Pending Orders: ${pendingRow.pending}`;
          
          bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        });
      });
    });
  } else if (text.startsWith('/confirm_')) {
    const phone = text.replace('/confirm_', '');
    
    db.all('SELECT * FROM orders WHERE phone LIKE ? AND status = "pending" ORDER BY timestamp DESC LIMIT 1', 
      [`%${phone}%`], 
      (err, rows) => {
        if (err || rows.length === 0) {
          bot.sendMessage(chatId, 'No pending order found for this phone number');
          return;
        }
        
        const order = rows[0];
        
        db.run('UPDATE orders SET status = ? WHERE id = ?', ['confirmed', order.id], (err) => {
          const message = 
            `✅ *Order Confirmed!*\n\n` +
            `🔖 Order: ${order.order_number}\n` +
            `📞 Phone: ${order.phone}\n` +
            `💰 Total: $${order.total_cost.toFixed(2)}\n\n` +
            `Customer will be notified automatically.`;
          
          bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        });
      }
    );
  }
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`\n☕ MING COFFEE Backend Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🤖 Telegram bot connected and ready`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});