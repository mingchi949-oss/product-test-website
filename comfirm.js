  // Configuration - matching weborder.js
  const botToken = "8749837452:AAF_TCGDTvgK4bLXBIoM4eQLjxv27Rxcksw";
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone");
  const summary = urlParams.get("summary");

  let isProcessed = false;

  function checkConfirmation() {
    if (!phone || isProcessed) {
      console.log("checkConfirmation: Phone not available or already processed.");
      return;
    }

    // offset=-100 forces Telegram to return the most recent updates even if already seen
    const apiUrl = `https://api.telegram.org/bot${botToken}/getUpdates?limit=100&offset=-100&_=${Date.now()}`;

    fetch(apiUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        if (data.ok && data.result.length > 0) {
          // Safely sanitize the phone to match the Telegram callback data
          const targetData = `confirm_${(phone || "").replace(/\D/g, "")}`;

          // Search for a button click (callback_query) that matches this order's phone number
          const confirmedUpdate = data.result.find((update) => {
            if (!update.callback_query) return false;
            const callbackData = update.callback_query.data;
            return callbackData === targetData;
          });

          if (confirmedUpdate) {
            isProcessed = true;

            // Send feedback back to Telegram (This is the "auto like/emoji" part)
            const callbackQueryId = confirmedUpdate.callback_query.id;
            fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: "✅ Order Confirmed! ☕", // This shows up in Telegram
                show_alert: false,
              }),
            }).catch((err) => console.error("Error answering callback:", err));

            // Redirect directly to the next.html page, which will display the confirmation
            console.log(
              "comfirm.js - Redirecting to:",
              `next.html?phone=${encodeURIComponent(phone)}&summary=${encodeURIComponent(summary)}`,
            );
            window.location.href = `next.html?phone=${encodeURIComponent(phone)}&summary=${encodeURIComponent(summary)}`;
          }
        }
      })
      .catch((error) => {
        console.error("Telegram API Error:", error);
      });
  }

  // Check frequently for a near-instant response (2 second polling)
  checkConfirmation();
  setInterval(checkConfirmation, 2000);
  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get("phone");
    const summary = urlParams.get("summary");
    const checkReceiptBtn = document.getElementById("check-receipt-btn");

    if (phone && summary) {
      const targetUrl = `next.html?phone=${encodeURIComponent(phone)}&summary=${encodeURIComponent(summary)}`;

      // Initialize 5-second cooldown
      let timeLeft = 5;
      checkReceiptBtn.style.pointerEvents = "none"; // Disable clicking
      checkReceiptBtn.style.opacity = "0.5"; // Make it look disabled
      checkReceiptBtn.innerText = `Check (${timeLeft}s)`;

      const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
          checkReceiptBtn.innerText = `Check (${timeLeft}s)`;
        } else {
          clearInterval(timer);
          checkReceiptBtn.innerText = "Check order confirm";
          checkReceiptBtn.href = targetUrl;
          checkReceiptBtn.style.pointerEvents = "auto";
          checkReceiptBtn.style.opacity = "1";
        }
      }, 1000);
    } else {
      // Hide the button if no order data is found
      checkReceiptBtn.style.display = "none";
    }
  });
