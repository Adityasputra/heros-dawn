// Import all required modules at the top
import QuestsView from "./views/quests.js";
import InventoryView from "./views/inventory.js";
import BattleView, { initBattle } from "./views/battle.js";
import ShopView from "./views/shop.js";
import { playerInventory } from "./items.js";

// === Game State Management ===
const stats = {
  hp: { current: 80, max: 100 },
  mp: { current: 25, max: 50 },
  exp: { current: 60, max: 100 },
};

// Expose stats for other modules
export { stats, updateBars, showNotification };

// === DOM References ===
const gameContent = document.getElementById("gameContent");
const musicBtn = document.getElementById("musicBtn");
const musicStatus = document.getElementById("musicStatus");

// === Audio System ===
let musicOn = false;
let audio = new Audio("assets/music.mp3");
audio.loop = true;
audio.volume = 0.7; // Set to 70% volume by default

// Initialize UI components when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Setup UI controls
  setupControls();

  // Initialize router
  router();

  // Start tip rotation
  FooterTips.init();

  // Update stat bars initially
  updateBars();
});

// === Setup UI Controls ===
function setupControls() {
  // Exit button
  const exitBtn = document.getElementById("exitBtn");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      // Clear all local storage data
      localStorage.clear();
      // Navigate to home page
      window.location.href = "index.html";
    });
  }

  // Music toggle
  if (musicBtn) {
    musicBtn.addEventListener("click", toggleMusic);
  }

  // Navigation buttons
  setupNavButtons();
}

// === Music Controls ===
function toggleMusic() {
  musicOn = !musicOn;

  if (musicOn) {
    audio.play().catch((err) => {
      console.error("Error playing audio:", err);
      showNotification("Music playback failed. Try again.", "error");
    });
    musicStatus.textContent = "Music: ON";
  } else {
    audio.pause();
    musicStatus.textContent = "Music: OFF";
  }
}

// === Stats Management ===
function updateBars() {
  try {
    const hpPercent = (stats.hp.current / stats.hp.max) * 100;
    const mpPercent = (stats.mp.current / stats.mp.max) * 100;
    const expPercent = (stats.exp.current / stats.exp.max) * 100;

    // Update the width of the stat bars
    const hpBar = document.getElementById("hp-bar");
    const mpBar = document.getElementById("mp-bar");
    const expBar = document.getElementById("exp-bar");

    if (hpBar) hpBar.style.width = hpPercent + "%";
    if (mpBar) mpBar.style.width = mpPercent + "%";
    if (expBar) expBar.style.width = expPercent + "%";

    // Update the text values
    const hpText = document.getElementById("stat-hp");
    const mpText = document.getElementById("stat-mp");
    const expText = document.getElementById("stat-exp");

    if (hpText) hpText.textContent = `${stats.hp.current}/${stats.hp.max}`;
    if (mpText) mpText.textContent = `${stats.mp.current}/${stats.mp.max}`;
    if (expText) expText.textContent = `${stats.exp.current}/${stats.exp.max}`;

    // Update ARIA values for accessibility
    updateAriaValues();
  } catch (error) {
    console.error("Error updating bars:", error);
  }
}

// Update ARIA attributes for accessibility
function updateAriaValues() {
  // Get all progress bars
  const progressBars = document.querySelectorAll('[role="progressbar"]');

  // Update each bar's ARIA attributes
  progressBars.forEach((bar) => {
    const type = bar.id.includes("hp")
      ? "hp"
      : bar.id.includes("mp")
      ? "mp"
      : "exp";

    const current = stats[type].current;
    const max = stats[type].max;
    const percent = (current / max) * 100;

    bar.setAttribute("aria-valuenow", percent);
    bar.setAttribute("aria-valuemin", 0);
    bar.setAttribute("aria-valuemax", 100);
  });
}

// === Notification System ===
function showNotification(message, type = "normal") {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  // Remove notification after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add("fade-out");

      // Remove from DOM after animation completes
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 4000);
}

// === Footer Tips System ===
class FooterTips {
  static tips = [
    "💡 Tip: Click items in inventory to see detailed information",
    "🎮 Tip: Use Tab key to navigate between interface elements",
    "⚔️ Tip: Keep your health above 30% to avoid critical status",
    "📜 Tip: Complete quests to gain experience and rewards",
    "🎵 Tip: Toggle music on/off with the music button",
    "💾 Tip: Your progress is automatically saved",
    "🌟 Tip: Rare items have special colored borders",
    "⚡ Tip: Equipped items are marked with a lightning bolt",
  ];

  static init() {
    this.currentTip = 0;
    this.tipElement = document.getElementById("footerTip");

    if (this.tipElement) {
      this.startRotation();
    }
  }

  static startRotation() {
    setInterval(() => {
      this.showNextTip();
    }, 10000); // Change tip every 10 seconds
  }

  static showNextTip() {
    this.tipElement.style.opacity = "0";

    setTimeout(() => {
      this.currentTip = (this.currentTip + 1) % this.tips.length;
      this.tipElement.textContent = this.tips[this.currentTip];
      this.tipElement.style.opacity = "1";
    }, 300);
  }
}

// === Router and Views ===
// Check if tutorial is completed
let tutorialDone = localStorage.getItem("tutorialDone") === "true";

// Dashboard view
function DashboardView() {
  return `
    <section class="dashboard">
      <h2>📋 Dashboard</h2>
      <p>Main menu overview:</p>
      <ul>
        <li>📜 Quests - View and complete missions</li>
        <li>🎒 Inventory - Manage items & equipment</li>
        <li>⚔️ Battle - Fight enemies for EXP</li>
        <li>🛒 Shop - Buy & sell items</li>
      </ul>
    </section>
  `;
}

// Dialog view for tutorial
function DialogView() {
  return `
    <section class="dialog-container">
      <div class="npc-portrait">
        <img src="assets/chars/hero.png" alt="NPC portrait"/>
        <div class="npc-name">Guide</div>
      </div>
      <div class="dialog-box">
        <p class="dialog-text">
          Hello, <span id="playerName">${
            document.getElementById("characterName")?.textContent ||
            "Adventurer"
          }</span>! <br /><br />
          Welcome to the world of <b>Hero's Dawn</b>.
          <br />
          <b>Quests</b>: View and complete adventures to earn rewards.
          <br />
          <b>Inventory</b>: Manage your items, weapons, and equipment.
          <br />
          <b>Battle</b>: Fight enemies to gain experience and level up.
          <br />
          <b>Shop</b>: Buy and sell items to prepare for your journey.
          <br /><br />
          May your adventure be legendary!
        </p>
        <div class="dialog-controls">
          <button class="btn btn-primary" id="dialogNextBtn">
            Continue
          </button>
        </div>
      </div>
    </section>
  `;
}

// Router table
const routes = {
  "": () => (tutorialDone ? DashboardView() : DialogView()),
  quests: QuestsView,
  inventory: InventoryView,
  battle: BattleView,
  shop: ShopView,
};

// Router function
function router() {
  const hash = window.location.hash.replace("#", "");
  const view = routes[hash] || routes[""];

  if (gameContent) {
    gameContent.innerHTML = view();

    // Initialize specific view functionality
    if (hash === "battle") {
      initBattle(1);
    }

    // Handle tutorial dialog button
    if (!tutorialDone && hash === "") {
      const btn = document.getElementById("dialogNextBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          tutorialDone = true;
          localStorage.setItem("tutorialDone", "true");
          router(); // Re-render to dashboard
        });
      }
    }

    // Add a back button event listener to each view
    const backBtn = document.getElementById("backButton");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.hash = "";
      });
    }
  }
}

// Setup navigation buttons
function setupNavButtons() {
  const navButtons = {
    questBtn: "quests",
    inventoryBtn: "inventory",
    battleBtn: "battle",
    shopBtn: "shop",
  };

  // Add click handlers to each navigation button
  Object.entries(navButtons).forEach(([buttonId, route]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => {
        // Toggle if already on this route
        if (window.location.hash === `#${route}`) {
          window.location.hash = "";
        } else {
          window.location.hash = route;
        }
      });
    }
  });
}

// Listen for hash changes
window.addEventListener("hashchange", router);

// Theme toggle functionality
document.getElementById("themeBtn")?.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light-theme") ? "light" : "dark"
  );
});

// Apply saved theme on load
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-theme");
}

// Save data periodically
setInterval(() => {
  try {
    localStorage.setItem("playerStats", JSON.stringify(stats));
    localStorage.setItem("playerInventory", JSON.stringify(playerInventory));

    // Update save status
    const saveStatus = document.getElementById("saveStatusText");
    if (saveStatus) {
      saveStatus.textContent = "Auto-saved";

      // Flash the save text for visual feedback
      saveStatus.classList.add("save-flash");
      setTimeout(() => {
        saveStatus.classList.remove("save-flash");
      }, 1000);
    }
  } catch (error) {
    console.error("Error saving game data:", error);
  }
}, 60000); // Save every minute
