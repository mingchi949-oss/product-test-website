// ============================================
// MING COFFEE - Enhanced Interactive Features
// ============================================

// Particle Animation System
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;

  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation delay and duration
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    
    // Random size
    const size = Math.random() * 3 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random opacity
    particle.style.opacity = Math.random() * 0.3 + 0.1;
    
    particlesContainer.appendChild(particle);
  }
}

// Initialize particles on page load
document.addEventListener('DOMContentLoaded', createParticles);

// ============================================
// Search & Filter Functions
// ============================================

function searchBrandsAll() {
  // 1. Get what the customer is typing right now
  const searchInput = document
    .getElementById("brandSearch")
    .value.toLowerCase()
    .trim();

  // Show/Hide the 'x' button in search bar
  const clearBtn = document.getElementById("clear-search-btn");
  if (clearBtn) clearBtn.style.display = searchInput ? "block" : "none";

  // 1. Sidebar Category Filtering: Highlights/Hides the category buttons
  const container = document.getElementById("brand-list-container");
  const items = container.getElementsByClassName("brand-item");

  for (let i = 0; i < items.length; i++) {
    const text = items[i].textContent || items[i].innerText;
    if (text.toLowerCase().includes(searchInput)) {
      items[i].style.display = ""; // Keep button visible
    } else {
      items[i].style.display = "none"; // Hide button if user types something else
    }
  }

  // 2. Product Gallery Filtering: Hide/Show items based on search input
  const products = document.getElementsByClassName("glass-card");
  for (let i = 0; i < products.length; i++) {
    const title = products[i].querySelector("h1");
    if (title) {
      const text = title.textContent || title.innerText;
      products[i].style.display = text.toLowerCase().includes(searchInput)
        ? ""
        : "none";
    }
  }
}

// Helper function to set the search input and trigger the filter
function setSearchAndFilter(brand) {
  document.getElementById("brandSearch").value = brand;
  searchBrandsAll();
}

// Function to clear the search input and reset filters
function clearSearch() {
  document.getElementById("brandSearch").value = "";
  searchBrandsAll();
}

function toggleSocials() {
  document.getElementById("socialLinks").classList.toggle("show");
}

// ============================================
// Cart Management System
// ============================================

let cart = JSON.parse(localStorage.getItem("coffeeCart")) || [];

function updateBadge() {
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.innerText = totalQty;
    
    // Add pulse animation when cart updates
    badge.style.animation = 'none';
    setTimeout(() => {
      badge.style.animation = 'cart-bounce 0.5s ease';
    }, 10);
  }
}

// Add cart bounce animation
const style = document.createElement('style');
style.textContent = `
  @keyframes cart-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }
`;
document.head.appendChild(style);

updateBadge();

function addToOrder(name, price) {
  // Create a cool custom modal instead of browser prompts
  const modalOverlay = document.createElement("div");
  modalOverlay.className = 'modal';
  modalOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); backdrop-filter: blur(15px);
    display: flex; align-items: center; justify-content: center; z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;

  const modalContent = document.createElement("div");
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: rgba(17, 17, 17, 0.95); border: 1px solid var(--accent); 
    padding: 30px; border-radius: 20px; width: 95%; max-width: 450px; 
    text-align: center; box-shadow: 0 0 60px rgba(0, 255, 204, 0.3);
    animation: slideUp 0.4s ease;
  `;

  modalContent.innerHTML = `
    <h2 style="margin-bottom: 20px; font-size: 1.5rem; color: #fff; font-weight: 700;">
      Order ${name}
    </h2>
    
    <div style="margin-bottom: 20px;">
      <p style="color: rgba(255,255,255,0.6); margin-bottom: 10px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">
        Size
      </p>
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        <button class="size-btn" data-size="M" style="padding: 10px 24px; border: 2px solid #333; background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; border-radius: 12px; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">M <span style="font-size: 0.75rem; opacity: 0.7;">(+$0.25)</span></button>
        <button class="size-btn" data-size="L" style="padding: 10px 24px; border: 2px solid var(--accent); background: rgba(0,255,204,0.1); color: #fff; cursor: pointer; border-radius: 12px; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">L</button>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <p style="color: rgba(255,255,255,0.6); margin-bottom: 10px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">
        Sugar Level
      </p>
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        <button class="sugar-btn" data-sugar="0%" style="padding: 10px 16px; border: 2px solid #333; background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; border-radius: 12px; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">0%</button>
        <button class="sugar-btn" data-sugar="25%" style="padding: 10px 16px; border: 2px solid #333; background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; border-radius: 12px; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">25%</button>
        <button class="sugar-btn" data-sugar="50%" style="padding: 10px 16px; border: 2px solid var(--accent); background: rgba(0,255,204,0.1); color: #fff; cursor: pointer; border-radius: 12px; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">50%</button>
        <button class="sugar-btn" data-sugar="75%" style="padding: 10px 16px; border: 2px solid #333; background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; border-radius: 12px; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">75%</button>
        <button class="sugar-btn" data-sugar="100%" style="padding: 10px 16px; border: 2px solid #333; background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; border-radius: 12px; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">100%</button>
      </div>
    </div>

    <div style="margin-bottom: 25px;">
      <p style="color: rgba(255,255,255,0.6); margin-bottom: 10px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">
        Quantity
      </p>
      <input type="number" id="order-qty" value="1" min="1" style="width: 80px; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; text-align: center; border-radius: 12px; outline: none; font-size: 1.1rem; font-weight: bold; backdrop-filter: blur(10px);">
    </div>

    <div style="display: flex; gap: 10px;">
      <button id="cancel-order" style="flex: 1; padding: 14px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; cursor: pointer; transition: all 0.3s; font-weight: 600; backdrop-filter: blur(10px);">Cancel</button>
      <button id="confirm-order" style="flex: 1; padding: 14px; background: linear-gradient(135deg, var(--accent), #00ccff); color: #000; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px;">Add to Cart</button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  let selectedSize = "L"; // Default selection
  let selectedSugar = "50%"; // Default selection
  
  const sizeBtns = modalContent.querySelectorAll(".size-btn");
  sizeBtns.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      if (this.dataset.size !== selectedSize) {
        this.style.borderColor = 'rgba(0, 255, 204, 0.5)';
        this.style.background = 'rgba(0, 255, 204, 0.05)';
      }
    });
    
    btn.addEventListener('mouseleave', function() {
      if (this.dataset.size !== selectedSize) {
        this.style.borderColor = '#333';
        this.style.background = 'rgba(255,255,255,0.05)';
      }
    });
    
    btn.onclick = () => {
      sizeBtns.forEach(b => {
        b.style.borderColor = '#333';
        b.style.background = 'rgba(255,255,255,0.05)';
      });
      
      btn.style.borderColor = 'var(--accent)';
      btn.style.background = 'rgba(0,255,204,0.1)';
      selectedSize = btn.dataset.size;
    };
  });
  
  const sugarBtns = modalContent.querySelectorAll(".sugar-btn");
  
  sugarBtns.forEach(btn => {
    // Add hover effects
    btn.addEventListener('mouseenter', function() {
      if (this.dataset.sugar !== selectedSugar) {
        this.style.borderColor = 'rgba(0, 255, 204, 0.5)';
        this.style.background = 'rgba(0, 255, 204, 0.05)';
      }
    });
    
    btn.addEventListener('mouseleave', function() {
      if (this.dataset.sugar !== selectedSugar) {
        this.style.borderColor = '#333';
        this.style.background = 'rgba(255,255,255,0.05)';
      }
    });
    
    btn.onclick = () => {
      // Reset all buttons
      sugarBtns.forEach(b => {
        b.style.borderColor = '#333';
        b.style.background = 'rgba(255,255,255,0.05)';
      });
      
      // Highlight selected
      btn.style.borderColor = 'var(--accent)';
      btn.style.background = 'rgba(0,255,204,0.1)';
      selectedSugar = btn.dataset.sugar;
    };
  });

  // Cancel button
  document.getElementById("cancel-order").onclick = () => {
    modalOverlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => modalOverlay.remove(), 300);
  };

  // Confirm button
  document.getElementById("confirm-order").onclick = () => {
    const qty = parseInt(document.getElementById("order-qty").value) || 1;
    
    // Add $0.25 surcharge for size M
    let finalPrice = price;
    if (selectedSize === "M") {
      finalPrice = price + 0.25;
    }
    
    const existingItem = cart.find(item => item.name === name && item.sugar === selectedSugar && item.size === selectedSize);
    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.push({ name, price: finalPrice, qty, sugar: selectedSugar, size: selectedSize });
    }

    localStorage.setItem("coffeeCart", JSON.stringify(cart));
    updateBadge();
    
    // Success animation
    modalOverlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => modalOverlay.remove(), 300);
    
    // Show success feedback
    showSuccessNotification(`${qty}x ${name} (${selectedSize}) added to cart!`);
  };

  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => modalOverlay.remove(), 300);
    }
  });
}

// Success Notification
function showSuccessNotification(message) {
  const notification = document.createElement('div');
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
  `;
  notification.textContent = message;
  
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
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(notificationStyle);

// ============================================
// Cart UI Functions
// ============================================

function updateCartUI() {
  document.getElementById("cart-count").innerText = cart.length;
  const itemsContainer = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");

  let html = "";
  let total = 0; // Initialize total to 0
  if (cart.length > 0) {
    cart.forEach((item, index) => {
      html += `
        <div class="cart-item-row">
          <p>${item.name} (${item.size}) (${item.sugar} sugar) - $${item.price.toFixed(2)}</p>
          <button class="remove-item-btn" onclick="removeItem(${index})">x</button>
        </div>
      `;
      total += item.price;
    });
  }
  itemsContainer.innerHTML = html || "<p style='text-align: center; color: rgba(255,255,255,0.5);'>Your cart is empty.</p>";
  totalElement.innerText = total.toFixed(2);
}

function showCart() {
  document.getElementById("cart-modal").style.display = "flex";
  updateCartUI();
}

function closeCart() {
  document.getElementById("cart-modal").style.display = "none";
}

// Close the menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function removeItem(index) {
  cart.splice(index, 1); // Remove 1 item at the given index
  localStorage.setItem("coffeeCart", JSON.stringify(cart));
  updateCartUI(); // Refresh the cart display
  updateBadge();
}

function checkout() {
  if (cart.length === 0) {
    showSuccessNotification('Your cart is empty!');
    return;
  }

  let whatsappMessage = "New Order from Website:%0A";
  let telegramMessageContent = "New Order from Website:\n";
  let total = 0;

  cart.forEach((item) => {
    const itemDetails = `- ${item.name} (${item.size}) (${item.sugar} sugar) ($${item.price.toFixed(2)})`;
    whatsappMessage += itemDetails + "%0A";
    telegramMessageContent += itemDetails + "\n";
    total += item.price;
    trackOrder(item.name, item.price);
  });

  // Send to Admin's private WhatsApp
  window.open(
    `https://wa.me/85512345678?text=${whatsappMessage}%0ATotal: $${total.toFixed(2)}`,
    "_blank",
  );

  // Send to Telegram Bot (via your backend)
  sendOrderToTelegram(telegramMessageContent, total);

  // Immediately clear the cart and UI to keep order details private
  cart = [];
  localStorage.removeItem("coffeeCart");
  updateCartUI();
  updateBadge();
  closeCart();
  
  showSuccessNotification('Order placed successfully!');
}

function sendOrderToTelegram(messageContent, orderTotal) {
  const fullMessage = messageContent + `Total: $${orderTotal.toFixed(2)}`;
  fetch("/api/send-telegram-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: fullMessage }),
  })
    .then((response) =>
      response.ok
        ? console.log("Order sent to Telegram bot successfully!")
        : console.error("Failed to send order to Telegram bot."),
    )
    .catch((error) =>
      console.error("Error sending order to Telegram bot:", error),
    );
}

// ============================================
// Gallery Functions
// ============================================

function openGallery() {
  document.getElementById("lightbox").style.display = "flex";
}

function swap(imgSrc) {
  document.getElementById("currentView").src = imgSrc;
  
  const main = document.getElementById("currentView");
  main.style.opacity = 0;
  setTimeout(() => {
    main.style.opacity = 1;
  }, 50);
}

// ============================================
// Scroll Animations
// ============================================

// Add scroll reveal animation
function revealOnScroll() {
  const elements = document.querySelectorAll('.glass-card, .glass-sidebar');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    
    if (elementTop < window.innerHeight && elementBottom > 0) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

// Initialize scroll reveal
window.addEventListener('scroll', revealOnScroll);

// ============================================
// Smooth Scroll for Navigation
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// Authentication Modal Functions
// ============================================

function showAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('auth-name').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-name').focus();
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function validateAuth() {
  const name = document.getElementById('auth-name').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!name || !password) {
    showSuccessNotification('Please enter both name and password!');
    return;
  }

  // Simple validation - you can customize the password
  const correctPassword = '1234'; // Set your password here
  const correctName = 'admin'; // Set your name here

  // Case-insensitive name comparison
  if (name.toLowerCase() === correctName.toLowerCase() && password === correctPassword) {
    closeAuthModal();
    showSuccessNotification('Access granted! Redirecting...');
    setTimeout(() => {
      window.location.href = './reset-counter.html';
    }, 1000);
  } else {
    showSuccessNotification('Invalid name or password!');
    document.getElementById('auth-password').value = '';
  }
}

// Add event listeners for auth modal
document.addEventListener('DOMContentLoaded', function() {
  const cancelBtn = document.getElementById('cancel-auth');
  const confirmBtn = document.getElementById('confirm-auth');
  const passwordInput = document.getElementById('auth-password');
  const nameInput = document.getElementById('auth-name');
  const togglePasswordBtn = document.getElementById('toggle-password');

  if (cancelBtn) {
    cancelBtn.onclick = closeAuthModal;
  }

  if (confirmBtn) {
    confirmBtn.onclick = validateAuth;
  }

  // Password visibility toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle eye icon
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }

  // Allow Enter key to submit
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        validateAuth();
      }
    });
  }

  if (nameInput) {
    nameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        passwordInput.focus();
      }
    });
  }

  // Close modal on overlay click
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.addEventListener('click', function(e) {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }

});

// ============================================
// Star Rating System
// ============================================

function initRatingSystem() {
  const ratingContainers = document.querySelectorAll('.rating-container');
  
  ratingContainers.forEach(container => {
    const stars = container.querySelectorAll('.star');
    const ratingText = container.querySelector('.rating-text');
    const productName = container.dataset.product;
    
    // Load saved rating from localStorage
    const savedRating = localStorage.getItem(`rating_${productName}`);
    if (savedRating) {
      updateStarDisplay(stars, parseInt(savedRating));
      ratingText.textContent = `${savedRating}/5`;
      container.classList.add('rated');
    }
    
    // Add click event to each star
    stars.forEach(star => {
      star.addEventListener('click', function() {
        const rating = parseInt(this.dataset.rating);
        
        // Save rating to localStorage
        localStorage.setItem(`rating_${productName}`, rating);
        
        // Update display
        updateStarDisplay(stars, rating);
        ratingText.textContent = `${rating}/5`;
        container.classList.add('rated');
        
        // Add a brief animation
        this.style.transform = 'scale(1.4)';
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 200);
      });
      
      // Hover effect
      star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.dataset.rating);
        highlightStars(stars, rating);
      });
      
      star.addEventListener('mouseleave', function() {
        const savedRating = localStorage.getItem(`rating_${productName}`);
        if (savedRating) {
          updateStarDisplay(stars, parseInt(savedRating));
        } else {
          clearStars(stars);
        }
      });
    });
  });
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
      star.classList.remove('hover');
    } else {
      star.classList.remove('active', 'hover');
    }
  });
}

function highlightStars(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('hover');
    } else {
      star.classList.remove('hover');
    }
  });
}

function clearStars(stars) {
  stars.forEach(star => {
    star.classList.remove('active', 'hover');
  });
}

// ============================================
// Initialize on Page Load
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize rating system
  initRatingSystem();
  
  // Add fade-in animation to cards
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Initialize cart from localStorage
  updateBadge();
  
  console.log('%c☕ MING COFFEE %cReady to serve!', 
    'color: #00ffcc; font-size: 20px; font-weight: bold;', 
    'color: #fff; font-size: 14px;'
  );
});
