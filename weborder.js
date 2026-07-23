// ============================================
// MING COFFEE - Order Page Enhanced
// ============================================

// Array to hold the items added to the cart
let cart = JSON.parse(localStorage.getItem("coffeeCart")) || [];

// ============================================
// Particle Animation for Order Page
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

// Initialize particles
document.addEventListener('DOMContentLoaded', createParticles);

// ============================================
// Cart Management Functions
// ============================================

// Function to add items to the cart array
function addToCart(itemName, price, inputId) {
  const quantity = parseInt(document.getElementById(inputId).value);

  if (quantity <= 0 || isNaN(quantity)) return;

  // Check if item already exists in cart
  const existingItem = cart.find((item) => item.name === itemName);

  if (existingItem) {
    // If it exists, just add to the quantity
    existingItem.qty += quantity;
  } else {
    // Otherwise, add a new item object to the array
    cart.push({ name: itemName, price: price, qty: quantity });
  }

  // Reset the input field back to 1
  document.getElementById(inputId).value = 1;

  // Refresh the display
  updateCartUI();
  
  // Update the cart badge on the main page
  if (typeof updateBadge === 'function') {
    updateBadge();
  }
  
  // Show success notification
  showSuccessNotification(`${quantity}x ${itemName} added to cart!`);
}

// Function to remove an item from the cart and update local storage
function removeFromCart(index) {
  const itemName = cart[index].name;
  cart.splice(index, 1);
  localStorage.setItem("coffeeCart", JSON.stringify(cart));
  updateCartUI();
  
  // Update the cart badge on the main page
  if (typeof updateBadge === 'function') {
    updateBadge();
  }
  
  showSuccessNotification(`${itemName} removed from cart`);
}

// Function to display the cart items on the screen
function updateCartUI() {
  const cartList = document.getElementById("cart-list");
  const cartTotal = document.getElementById("cart-total");

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="cart-empty-message">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
      </div>
    `;
    cartTotal.innerText = "$0.00";
    return;
  }

  cartList.innerHTML = "";
  let totalCost = 0;

  cart.forEach((item, index) => {
    const basePrice = item.price - (item.size === "M" ? 0.25 : 0);
    const itemTotal = item.price * item.qty;
    totalCost += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item-row';
    cartItem.style.animation = `slideInLeft 0.3s ease ${index * 0.1}s both`;
    
    // Show price breakdown for size M
    const sizeSurcharge = item.size === "M" ? `
      <small style="color: rgba(255,255,255,0.5); font-size: 0.8rem; display: block; margin-top: 2px;">
        Base: $${basePrice.toFixed(2)} + Size M: $0.25
      </small>
    ` : '';
    
    cartItem.innerHTML = `
      <div style="flex-grow: 1; text-align: left;">
        <p style="margin: 0; font-weight: 600; color: #fff; font-size: 0.95rem;">
          ${item.qty}x ${item.name} <span style="color: var(--accent);">(${item.size || "L"})</span>
        </p>
        <small style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">
          <i class="fas fa-cube" style="color: var(--accent);"></i> Sugar: ${item.sugar || "100%"}
        </small>
        ${sizeSurcharge}
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="color: var(--accent); font-weight: 700; font-size: 1rem; text-shadow: 0 0 10px rgba(0, 255, 204, 0.5);">
          $${itemTotal.toFixed(2)}
        </span>
        <button class="remove-item-btn" onclick="removeFromCart(${index})">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    
    cartList.appendChild(cartItem);
  });

  // Animate total
  cartTotal.style.transform = 'scale(1.2)';
  cartTotal.style.transition = 'transform 0.3s ease';
  cartTotal.innerText = `$${totalCost.toFixed(2)}`;
  
  setTimeout(() => {
    cartTotal.style.transform = 'scale(1)';
  }, 300);
}

// Load the cart display automatically when the order page opens
updateCartUI();

// Display order history on page load
document.addEventListener('DOMContentLoaded', function() {
  displayOrderHistory();
});

// ============================================
// Order History System
// ============================================

let currentOrderNumber = null;
let telegramOrderNumber = null;

// Save order to history
function saveOrderToHistory(orderNumber, telegramOrderNumber, phone, location, comment, cart, totalCost) {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
  
  const order = {
    orderNumber: orderNumber,
    telegramOrderNumber: telegramOrderNumber,
    phone: phone,
    location: location,
    comment: comment,
    items: cart.map(item => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      size: item.size || "L",
      sugar: item.sugar || "100%"
    })),
    totalCost: totalCost,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
  
  orderHistory.unshift(order); // Add to beginning of array
  localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
}

// Display order history
function displayOrderHistory() {
  const historyContainer = document.getElementById("order-history-container");
  if (!historyContainer) return;
  
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
  
  if (orderHistory.length === 0) {
    historyContainer.innerHTML = `
      <div class="no-history-message">
        <i class="fas fa-history"></i>
        <p>No order history yet</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="order-history-list">';
  
  orderHistory.forEach((order, index) => {
    const itemsList = order.items.map(item => 
      `${item.qty}x ${item.name} (${item.size})`
    ).join(', ');
    
    html += `
      <div class="history-item">
        <div class="history-header">
          <div class="history-order-number">
            <i class="fas fa-hashtag"></i> ${order.orderNumber}
          </div>
          <div class="history-date">${order.date}</div>
        </div>
        <div class="history-details">
          <p><i class="fas fa-phone"></i> ${order.phone}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${order.location}</p>
          <p><i class="fas fa-shopping-bag"></i> ${itemsList}</p>
          ${order.comment ? `<p><i class="fas fa-comment"></i> ${order.comment}</p>` : ''}
        </div>
        <div class="history-total">
          <i class="fas fa-dollar-sign"></i> ${order.totalCost.toFixed(2)}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  historyContainer.innerHTML = html;
}

function generateOrderNumber() {
  // Get the current order count from localStorage (for website display)
  let orderCount = parseInt(localStorage.getItem("orderCount")) || 0;
  
  // Increment the count
  orderCount++;
  
  // Save the updated count
  localStorage.setItem("orderCount", orderCount);
  
  // Return formatted order number starting from 1
  return `#${orderCount}`;
}

function generateTelegramOrderNumber() {
  // Get the Telegram order count from localStorage (separate from website)
  let telegramCount = parseInt(localStorage.getItem("telegramOrderCount")) || 0;
  
  // Increment the count
  telegramCount++;
  
  // Save the updated count
  localStorage.setItem("telegramOrderCount", telegramCount);
  
  // Return formatted order number starting from 1
  return `#${telegramCount}`;
}

function updateDeliveryInfo() {
  const locationSelect = document.getElementById("customerLocation");
  const deliveryInfo = document.getElementById("delivery-info");
  
  if (!locationSelect || !deliveryInfo) return;
  
  const selectedOption = locationSelect.value;
  
  if (selectedOption) {
    // Show delivery info without generating order number yet
    deliveryInfo.innerHTML = `
      <i class="fas fa-hashtag"></i>
      <span>${selectedOption}: Your order number will be generated after confirmation</span>
    `;
    deliveryInfo.classList.add("show");
  } else {
    // Hide delivery info if no option selected
    deliveryInfo.classList.remove("show");
  }
}

// Update delivery info when cart changes
const originalUpdateCartUI = updateCartUI;
updateCartUI = function() {
  originalUpdateCartUI();
  updateDeliveryInfo();
};

// ============================================
// Form Auto-save & Restore
// ============================================

// Load saved values from localStorage on page load
const phoneInput = document.getElementById("customerPhone");
const locationInput = document.getElementById("customerLocation");
const commentInput = document.getElementById("customerComment");

if (phoneInput) phoneInput.value = localStorage.getItem("savedPhone") || "";
if (locationInput) locationInput.value = localStorage.getItem("savedLocation") || "";
if (commentInput) commentInput.value = localStorage.getItem("savedComment") || "";

// Add listeners to save values to localStorage whenever they change
phoneInput?.addEventListener("input", () =>
  localStorage.setItem("savedPhone", phoneInput.value),
);
locationInput?.addEventListener("change", () =>
  localStorage.setItem("savedLocation", locationInput.value),
);
commentInput?.addEventListener("input", () =>
  localStorage.setItem("savedComment", commentInput.value),
);

// ============================================
// Success Notification System
// ============================================

function showSuccessNotification(message) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.success-notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, var(--accent), #00ccff);
    color: #000;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0, 255, 204, 0.4);
    z-index: 10000;
    animation: slideInRight 0.5s ease;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
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
  
  @keyframes slideInLeft {
    from {
      transform: translateX(-30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(notificationStyle);

// ============================================
// Checkout Form Handler
// ============================================

// Handle the checkout submit
document
  .getElementById("checkoutForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    // Get values directly from the input elements for validation and message construction
    const phone = document.getElementById("customerPhone").value;
    const location = document.getElementById("customerLocation").value;
    const comment = document.getElementById("customerComment").value;

    // Validation
    if (cart.length === 0) {
      showSuccessNotification('Your cart is empty!');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Confirm Order</span> <i class="fas fa-arrow-right"></i>';
      }
      return;
    }

    if (!phone || !location) {
      showSuccessNotification('Please fill in all required fields');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Confirm Order</span> <i class="fas fa-arrow-right"></i>';
      }
      return;
    }

    // Calculate total cost
    let totalCost = 0;
    cart.forEach((item) => {
      totalCost += item.price * item.qty;
    });

    const orderSummary = cart
      .map((item) => `${item.qty}x ${item.name}`)
      .join(", ");

    // Generate order number when order is actually submitted
    const orderNumber = generateOrderNumber();
    const telegramOrderNumber = generateTelegramOrderNumber();
    
    // Save order to history (localStorage for customer view)
    saveOrderToHistory(orderNumber, telegramOrderNumber, phone, location, comment, cart, totalCost);
    
    // Send order to backend API
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone,
          location: location,
          comment: comment || '',
          items: cart.map(item => ({
            name: item.name,
            price: item.price,
            qty: item.qty,
            size: item.size || "L",
            sugar: item.sugar || "100%"
          })),
          totalCost: totalCost
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cart and saved form data
        localStorage.removeItem("coffeeCart");
        localStorage.removeItem("savedPhone");
        localStorage.removeItem("savedLocation");
        localStorage.removeItem("savedComment");

        // Update the cart badge on the main page (set to 0)
        if (typeof updateBadge === 'function') {
          updateBadge();
        }

        // Redirect to pending page
        window.location.href = `pending.html?phone=${encodeURIComponent(phone)}&summary=${encodeURIComponent(orderSummary)}`;
      } else {
        showSuccessNotification('Something went wrong. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Confirm Order</span> <i class="fas fa-arrow-right"></i>';
        }
      }
    } catch (error) {
      console.error("Error:", error);
      showSuccessNotification('Network error. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Confirm Order</span> <i class="fas fa-arrow-right"></i>';
      }
    }
  });

// ============================================
// Success Modal
// ============================================

function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.style.display = 'flex';
    
    // Add animation
    modal.style.animation = 'fadeIn 0.5s ease';
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('success-modal');
  if (event.target === modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.style.display = 'none';
      window.location.href = 'web.html';
    }, 300);
  }
};

// ============================================
// Input Animations
// ============================================

// Add focus animations to form inputs
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
    this.parentElement.style.transition = 'transform 0.3s ease';
  });
  
  input.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
  });
});

// ============================================
// Button Ripple Effect
// ============================================

document.querySelectorAll('.submit-btn, .buy-btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// ============================================
// Console Branding
// ============================================

console.log('%c☕ MING COFFEE %cOrder Page', 
  'color: #00ffcc; font-size: 20px; font-weight: bold;', 
  'color: #fff; font-size: 14px;'
);