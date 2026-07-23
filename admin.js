// ============================================
// MING COFFEE - Admin Panel JavaScript
// ============================================

const API_BASE = 'http://localhost:3000/api';
let currentFilter = 'all';
let autoRefreshInterval;

// ============================================
// Particle Animation
// ============================================

function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;

  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    
    const size = Math.random() * 3 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.opacity = Math.random() * 0.3 + 0.1;
    
    particlesContainer.appendChild(particle);
  }
}

// ============================================
// Statistics
// ============================================

async function loadStatistics() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Error loading stats:', data.error);
      return;
    }
    
    document.getElementById('total-orders').textContent = data.totalOrders || 0;
    document.getElementById('today-orders').textContent = data.todayOrders || 0;
    document.getElementById('total-revenue').textContent = `$${(data.totalRevenue || 0).toFixed(2)}`;
    document.getElementById('pending-orders').textContent = data.pendingOrders || 0;
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

// ============================================
// Orders Management
// ============================================

async function loadOrders() {
  const ordersList = document.getElementById('orders-list');
  
  // Show loading
  ordersList.innerHTML = `
    <div class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading orders...</p>
    </div>
  `;
  
  try {
    const url = currentFilter === 'all' 
      ? `${API_BASE}/orders` 
      : `${API_BASE}/orders?status=${currentFilter}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      ordersList.innerHTML = `
        <div class="no-orders">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading orders: ${data.error}</p>
        </div>
      `;
      return;
    }
    
    if (data.orders.length === 0) {
      ordersList.innerHTML = `
        <div class="no-orders">
          <i class="fas fa-inbox"></i>
          <p>No orders found</p>
        </div>
      `;
      return;
    }
    
    displayOrders(data.orders);
    loadStatistics();
  } catch (error) {
    console.error('Error loading orders:', error);
    ordersList.innerHTML = `
      <div class="no-orders">
        <i class="fas fa-exclamation-circle"></i>
        <p>Error loading orders. Please try again.</p>
      </div>
    `;
  }
}

function displayOrders(orders) {
  const ordersList = document.getElementById('orders-list');
  
  let html = '';
  
  orders.forEach(order => {
    const statusClass = `status-${order.status}`;
    const date = new Date(order.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const itemsList = order.items.map(item => 
      `${item.qty}x ${item.name} (${item.size || 'L'}) - $${(item.price * item.qty).toFixed(2)}`
    ).join('<br>');
    
    html += `
      <div class="order-card">
        <div class="order-header">
          <div class="order-number">
            <i class="fas fa-hashtag"></i> ${order.order_number}
          </div>
          <div class="order-status ${statusClass}">
            ${order.status}
          </div>
        </div>
        
        <div class="order-details">
          <div class="order-detail">
            <i class="fas fa-phone"></i>
            ${order.phone}
          </div>
          <div class="order-detail">
            <i class="fas fa-map-marker-alt"></i>
            ${order.location}
          </div>
          <div class="order-detail">
            <i class="fas fa-clock"></i>
            ${date}
          </div>
          ${order.comment ? `
            <div class="order-detail">
              <i class="fas fa-comment"></i>
              ${order.comment}
            </div>
          ` : ''}
        </div>
        
        <div class="order-items">
          ${itemsList}
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <i class="fas fa-dollar-sign"></i> ${order.total_cost.toFixed(2)}
          </div>
          <div class="order-actions">
            ${getActionButtons(order)}
          </div>
        </div>
      </div>
    `;
  });
  
  ordersList.innerHTML = html;
}

function getActionButtons(order) {
  const buttons = [];
  
  switch(order.status) {
    case 'pending':
      buttons.push(`<button class="action-btn btn-confirm" onclick="updateOrderStatus(${order.id}, 'confirmed')">Confirm</button>`);
      buttons.push(`<button class="action-btn btn-cancel" onclick="updateOrderStatus(${order.id}, 'cancelled')">Cancel</button>`);
      break;
    case 'confirmed':
      buttons.push(`<button class="action-btn btn-preparing" onclick="updateOrderStatus(${order.id}, 'preparing')">Preparing</button>`);
      buttons.push(`<button class="action-btn btn-cancel" onclick="updateOrderStatus(${order.id}, 'cancelled')">Cancel</button>`);
      break;
    case 'preparing':
      buttons.push(`<button class="action-btn btn-ready" onclick="updateOrderStatus(${order.id}, 'ready')">Ready</button>`);
      break;
    case 'ready':
      buttons.push(`<button class="action-btn btn-complete" onclick="updateOrderStatus(${order.id}, 'completed')">Complete</button>`);
      break;
  }
  
  return buttons.join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification(`Order status updated to ${status}`, 'success');
      loadOrders();
    } else {
      showNotification(`Error: ${data.error}`, 'error');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('Error updating order status', 'error');
  }
}

// ============================================
// Filter System
// ============================================

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update current filter
      currentFilter = this.dataset.filter;
      
      // Load orders with new filter
      loadOrders();
    });
  });
}

// ============================================
// Notifications
// ============================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.5s ease;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 300px;
  `;
  
  const bgColor = type === 'success' 
    ? 'linear-gradient(135deg, #00ffcc, #00ccff)' 
    : type === 'error'
    ? 'linear-gradient(135deg, #ff4444, #cc0000)'
    : 'linear-gradient(135deg, #00ffcc, #00ccff)';
  
  notification.style.background = bgColor;
  notification.style.color = '#000';
  notification.style.boxShadow = '0 10px 30px rgba(0, 255, 204, 0.4)';
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  notification.innerHTML = `
    <span style="font-size: 1.2rem;">${icon}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyle);

// ============================================
// Auto Refresh
// ============================================

function startAutoRefresh() {
  // Refresh every 30 seconds
  autoRefreshInterval = setInterval(() => {
    loadOrders();
  }, 30000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Create particles
  createParticles();
  
  // Setup filters
  setupFilters();
  
  // Load initial orders
  loadOrders();
  
  // Start auto refresh
  startAutoRefresh();
  
  // Stop auto refresh when page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
      loadOrders();
    }
  });
  
  console.log('%c☕ MING COFFEE %cAdmin Panel Ready', 
    'color: #00ffcc; font-size: 20px; font-weight: bold;', 
    'color: #fff; font-size: 14px;'
  );
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});