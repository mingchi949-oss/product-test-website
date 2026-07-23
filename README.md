# ☕ MING COFFEE - Online Ordering System

A complete online ordering system for MING Coffee with backend API, database storage, and admin panel.

## 📋 Features

### Customer Features
- ✅ Browse products with search and filter
- ✅ Add items to cart with customization (size, sugar level)
- ✅ Complete checkout with delivery details
- ✅ Order history tracking
- ✅ Real-time order status updates
- ✅ Responsive design for mobile and desktop

### Admin Features
- ✅ View all orders with filtering
- ✅ Update order status (Pending → Confirmed → Preparing → Ready → Completed)
- ✅ Real-time statistics dashboard
- ✅ Auto-refresh every 30 seconds
- ✅ Cancel orders if needed

### Backend Features
- ✅ RESTful API with Express.js
- ✅ SQLite database for persistent storage
- ✅ Telegram bot integration for instant notifications
- ✅ Order number generation
- ✅ Statistics and reporting

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- express - Web server
- sqlite3 - Database
- cors - Cross-origin requests
- node-telegram-bot-api - Telegram integration
- body-parser - Request parsing

### Step 2: Configure Telegram Bot (Optional)

1. Create a bot on Telegram by messaging [@BotFather](https://t.me/BotFather)
2. Get your bot token
3. Create a group chat and add your bot
4. Get the chat ID (use @RawDataBot or similar)
5. Update the configuration in `server.js`:

```javascript
const botToken = "YOUR_BOT_TOKEN";
const chatId = "YOUR_CHAT_ID";
```

### Step 3: Start the Backend Server

```bash
npm start
```

The server will start on `http://localhost:3000`

You should see:
```
☕ MING COFFEE Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on http://localhost:3000
📊 API endpoints available at http://localhost:3000/api
🤖 Telegram bot connected and ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Access the Website

Open your browser and navigate to:
- **Customer Website**: `http://localhost:3000/web.html`
- **Order Page**: `http://localhost:3000/order.html`
- **Admin Panel**: `http://localhost:3000/admin.html`

## 📁 Project Structure

```
├── server.js           # Backend server with API and Telegram bot
├── package.json        # Dependencies and scripts
├── web.html           # Main menu page
├── order.html         # Order/checkout page
├── admin.html         # Admin panel
├── pending.html       # Order pending/confirmation page
├── web.js             # Main page JavaScript
├── weborder.js        # Order page JavaScript
├── admin.js           # Admin panel JavaScript
├── comfirm.js         # Order confirmation checker
├── webstyle.css       # Main stylesheet
├── ming_coffee.db     # SQLite database (auto-created)
└── README.md          # This file
```

## 🔌 API Endpoints

### Orders
- `GET /api/orders` - Get all orders (optional: `?status=pending`)
- `GET /api/orders/:id` - Get single order by ID
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/confirm` - Confirm order

### Statistics
- `GET /api/stats` - Get order statistics

### Health Check
- `GET /api/health` - Check if server is running

## 🗄️ Database Schema

### Orders Table
```sql
- id (Primary Key)
- order_number (Unique)
- telegram_order_number (Unique)
- phone
- location
- comment
- items (JSON)
- total_cost
- status (pending/confirmed/preparing/ready/completed/cancelled)
- timestamp
- date
```

### Counters Table
```sql
- name (Primary Key)
- value (Auto-incrementing counters)
```

## 🎯 Order Status Flow

```
Pending → Confirmed → Preparing → Ready → Completed
                ↓
             Cancelled
```

## 🤖 Telegram Bot Commands

Once the bot is running, you can use these commands in Telegram:

- `/start` - Show help message
- `/orders` - View recent orders
- `/pending` - View pending orders
- `/stats` - View statistics
- `/confirm_<phone>` - Confirm order by phone number

## 🔧 Configuration

### Environment Variables (Optional)

You can set these environment variables instead of editing the code:

```bash
PORT=3000                    # Server port (default: 3000)
HOST=your-domain.com         # For webhook (default: localhost)
TELEGRAM_BOT_TOKEN=xxx       # Bot token
TELEGRAM_CHAT_ID=xxx         # Chat ID
```

### Windows (Command Prompt)
```cmd
set PORT=3000
set TELEGRAM_BOT_TOKEN=your_token
node server.js
```

### Windows (PowerShell)
```powershell
$env:PORT=3000
$env:TELEGRAM_BOT_TOKEN="your_token"
node server.js
```

### Mac/Linux
```bash
export PORT=3000
export TELEGRAM_BOT_TOKEN="your_token"
npm start
```

## 📱 Usage

### For Customers
1. Browse products on the main page
2. Click "ORDER NOW" or "Add to Cart"
3. Select size and sugar level
4. Go to cart and click checkout
5. Fill in phone number and delivery option
6. Submit order
7. Wait for confirmation notification

### For Admins
1. Open admin panel at `http://localhost:3000/admin.html`
2. View incoming orders in real-time
3. Click action buttons to update order status:
   - **Confirm** - Accept the order
   - **Preparing** - Start making the order
   - **Ready** - Order is ready for pickup
   - **Complete** - Order completed
   - **Cancel** - Cancel the order
4. Monitor statistics dashboard

## 🛠️ Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check if Node.js is installed: `node --version`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Orders not sending to Telegram
- Verify bot token is correct
- Verify chat ID is correct
- Make sure bot is added to the group
- Check server console for errors

### Database errors
- Delete `ming_coffee.db` and restart server
- Check file permissions

### Frontend can't connect to backend
- Make sure server is running on port 3000
- Check browser console for CORS errors
- Verify API_BASE in admin.js matches server URL

## 📊 Features in Detail

### Order Management
- Automatic order number generation
- Duplicate order prevention
- Order history for customers
- Real-time status updates

### Notifications
- Instant Telegram notifications for new orders
- Status update notifications
- Order confirmation alerts

### Security
- Input validation
- SQL injection prevention
- CORS configuration
- XSS protection

## 🎨 Customization

### Change Colors
Edit `webstyle.css` and modify CSS variables:
```css
:root {
  --accent: #00ffcc;  /* Change this */
  --bg: #0a0a0a;
}
```

### Add Products
Edit `web.html` and add new product cards following the existing pattern.

### Change Admin Password
Edit `web.js` line 571-572:
```javascript
const correctPassword = '1234'; // Change this
const correctName = 'admin';     // Change this
```

## 📝 License

This project is created for MING Coffee. All rights reserved.

## 👨‍💻 Support

For issues or questions, contact the development team.

---

**Made with ☕ for MING COFFEE**