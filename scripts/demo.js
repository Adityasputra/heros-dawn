import QuestsView from "../views/questsView.js";
import InventoryView from "../views/inventory.js";
import BattleView, { initBattle } from "../views/battle.js";
import ShopView from "../views/shop.js";
import { playerInventory } from "../data/item.js";

// === Game State Management ===
const stats = {
  hp: { current: 80, max: 100 },
  mp: { current: 25, max: 50 },
  exp: { current: 60, max: 100 },
  level: 5,
  sp: 10,
  atk: 20,
  def: 12,
  spd: 18,
  luk: 7,
  int: 15,
  gold: 100
};

// Player data
const playerData = {
  name: "Hero",
  characterImage: "assets/chars/mario.svg",
  stats: stats
};

// Expose stats for other modules
export { stats, updateBars, showNotification, playerData, updateCharacterDisplay };

// === DOM References ===
const gameContent = document.getElementById("gameContent");
const musicBtn = document.getElementById("musicBtn");
const musicStatus = document.getElementById("musicStatus");

// === Audio System ===
let musicOn = false;
let audio = null;

try {
  audio = new Audio("assets/audio/bgm.mp3");
  audio.loop = true;
  audio.volume = 0.7;
} catch (error) {
  console.warn("Audio file not found, music disabled");
}

// === Views Import ===
let QuestsView, InventoryView, BattleView, ShopView;

// Dynamically import views with error handling
async function loadViews() {
  try {
    const questModule = await import("../views/questsView.js");
    QuestsView = questModule.default;
  } catch (error) {
    console.warn("QuestsView not available:", error.message);
    QuestsView = () => `<div class="error-view">Quests view is not available</div>`;
  }

  try {
    const inventoryModule = await import("../views/inventory.js");
    InventoryView = inventoryModule.default;
  } catch (error) {
    console.warn("InventoryView not available:", error.message);
    InventoryView = () => `<div class="error-view">Inventory view is not available</div>`;
  }

  try {
    const battleModule = await import("../views/battle.js");
    BattleView = battleModule.default;
  } catch (error) {
    console.warn("BattleView not available:", error.message);
    BattleView = () => `<div class="error-view">Battle view is not available</div>`;
  }

  try {
    const shopModule = await import("../views/shop.js");
    ShopView = shopModule.default;
  } catch (error) {
    console.warn("ShopView not available:", error.message);
    ShopView = () => `<div class="error-view">Shop view is not available</div>`;
  }
}

// Initialize UI components when DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing game...");
  
  // Load views first
  await loadViews();
  
  // Initialize game components
  setupControls();
  updateCharacterDisplay();
  updateBars();
  updateGoldDisplay();
  
  // Initialize router
  setupRouter();
  
  // Initial route
  router();
  
  // Setup footer tips
  new FooterTips();
  
  console.log("Game initialization complete");
});

// === Setup UI Controls ===
function setupControls() {
  // Music toggle
  if (musicBtn && musicStatus) {
    musicBtn.addEventListener("click", toggleMusic);
  }

  // Exit button
  const exitBtn = document.getElementById("exitBtn");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to exit the game?")) {
        window.close();
      }
    });
  }

  // Continue button (tutorial)
  const continueBtn = document.getElementById("continueBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      localStorage.setItem("tutorialDone", "true");
      showNotification("Welcome to the adventure!", "success");
      router(); // Refresh to show dashboard
    });
  }
}

// === Music Controls ===
function toggleMusic() {
  if (!audio) {
    showNotification("Audio not available", "warning");
    return;
  }

  musicOn = !musicOn;
  
  if (musicOn) {
    audio.play().catch(error => {
      console.warn("Could not play audio:", error);
      musicOn = false;
      updateMusicStatus();
    });
  } else {
    audio.pause();
  }
  
  updateMusicStatus();
}

function updateMusicStatus() {
  if (musicStatus) {
    musicStatus.textContent = musicOn ? "Music: ON" : "Music: OFF";
  }
}

// === Character Display Management ===
function updateCharacterDisplay() {
  // Update character name
  const nameElement = document.getElementById("characterName");
  if (nameElement) {
    nameElement.textContent = playerData.name;
  }

  // Update level
  const levelElement = document.getElementById("stat-lvl");
  if (levelElement) {
    levelElement.textContent = stats.level;
  }

  // Update individual stats
  const statElements = {
    'stat-sp': stats.sp,
    'stat-atk': stats.atk,
    'stat-def': stats.def,
    'stat-spd': stats.spd,
    'stat-luk': stats.luk,
    'stat-int': stats.int
  };

  Object.entries(statElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  // Update character image
  const imageElement = document.getElementById("characterImage");
  if (imageElement) {
    imageElement.src = playerData.characterImage;
    imageElement.alt = `${playerData.name} portrait`;
  }
}

// === Stats Management ===
function updateBars() {
  // Update HP bar
  const hpBar = document.getElementById("hp-bar");
  const hpText = document.getElementById("stat-hp");
  const hpContainer = hpBar?.closest('.bar');
  
  if (hpBar && hpText) {
    const hpPercent = (stats.hp.current / stats.hp.max) * 100;
    hpBar.style.width = `${hpPercent}%`;
    hpText.textContent = `${stats.hp.current}/${stats.hp.max}`;
    
    if (hpContainer) {
      hpContainer.setAttribute('aria-valuenow', stats.hp.current);
      hpContainer.setAttribute('aria-valuemax', stats.hp.max);
    }
  }

  // Update MP bar
  const mpBar = document.getElementById("mp-bar");
  const mpText = document.getElementById("stat-mp");
  const mpContainer = mpBar?.closest('.bar');
  
  if (mpBar && mpText) {
    const mpPercent = (stats.mp.current / stats.mp.max) * 100;
    mpBar.style.width = `${mpPercent}%`;
    mpText.textContent = `${stats.mp.current}/${stats.mp.max}`;
    
    if (mpContainer) {
      mpContainer.setAttribute('aria-valuenow', stats.mp.current);
      mpContainer.setAttribute('aria-valuemax', stats.mp.max);
    }
  }

  // Update EXP bar
  const expBar = document.getElementById("exp-bar");
  const expText = document.getElementById("stat-exp");
  const expContainer = expBar?.closest('.bar');
  
  if (expBar && expText) {
    const expPercent = (stats.exp.current / stats.exp.max) * 100;
    expBar.style.width = `${expPercent}%`;
    expText.textContent = `${stats.exp.current}/${stats.exp.max}`;
    
    if (expContainer) {
      expContainer.setAttribute('aria-valuenow', stats.exp.current);
      expContainer.setAttribute('aria-valuemax', stats.exp.max);
    }
  }
}

// === Gold Management ===
function updateGoldDisplay() {
  const topGoldElement = document.getElementById("topGold");
  if (topGoldElement) {
    topGoldElement.textContent = stats.gold;
  }

  // Update other gold displays if they exist
  const goldAmountElements = document.querySelectorAll(".gold-amount");
  goldAmountElements.forEach(element => {
    if (element.id !== "topGold") {
      element.textContent = `${stats.gold} Gold`;
    }
  });
}

// === Notification System ===
function showNotification(message, type = "normal") {
  const container = document.getElementById("notificationContainer");
  if (!container) {
    console.warn("Notification container not found");
    return;
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  
  // Add icon based on type
  const icons = {
    success: "✅",
    error: "❌", 
    warning: "⚠️",
    normal: "ℹ️"
  };
  
  const icon = icons[type] || icons.normal;
  notification.innerHTML = `<span class="notification-icon">${icon}</span><span class="notification-text">${message}</span>`;

  container.appendChild(notification);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add("fade-out");
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
  constructor() {
    this.tips = [
      "💡 Tip: Click items in your inventory to see details",
      "⚔️ Tip: Battle enemies to gain experience and gold",
      "🛒 Tip: Visit the shop to buy better equipment",
      "📜 Tip: Complete quests for valuable rewards",
      "🎵 Tip: Toggle music with the music button",
      "💾 Tip: Your progress is automatically saved"
    ];
    
    this.currentTip = 0;
    this.tipElement = document.getElementById("footerTip");
    
    if (this.tipElement) {
      this.startRotation();
    }
  }

  startRotation() {
    // Change tip every 10 seconds
    setInterval(() => {
      this.showNextTip();
    }, 10000);
  }

  showNextTip() {
    if (this.tipElement) {
      this.currentTip = (this.currentTip + 1) % this.tips.length;
      this.tipElement.textContent = this.tips[this.currentTip];
    }
  }
}

// === Router and Views ===
let tutorialDone = localStorage.getItem("tutorialDone") === "true";

function DashboardView() {
  return `
    <section class="dashboard">
      <header class="dashboard-header">
        <h2>🏠 Dashboard</h2>
        <p class="welcome-text">Welcome back, ${playerData.name}!</p>
      </header>
      
      <div class="dashboard-content">
        <div class="quick-stats">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-label">Level</div>
              <div class="stat-value">${stats.level}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <div class="stat-label">Gold</div>
              <div class="stat-value">${stats.gold}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚔️</div>
            <div class="stat-info">
              <div class="stat-label">Attack</div>
              <div class="stat-value">${stats.atk}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛡️</div>
            <div class="stat-info">
              <div class="stat-label">Defense</div>
              <div class="stat-value">${stats.def}</div>
            </div>
          </div>
        </div>

        <div class="dashboard-sections">
          <div class="section-card">
            <div class="section-icon">📜</div>
            <h3>Quests</h3>
            <p>Take on adventures and earn rewards</p>
            <button class="btn btn-primary" onclick="window.location.hash='quests'">View Quests</button>
          </div>
          
          <div class="section-card">
            <div class="section-icon">🎒</div>
            <h3>Inventory</h3>
            <p>Manage your items and equipment</p>
            <button class="btn btn-primary" onclick="window.location.hash='inventory'">Open Inventory</button>
          </div>
          
          <div class="section-card">
            <div class="section-icon">⚔️</div>
            <h3>Battle</h3>
            <p>Fight enemies and gain experience</p>
            <button class="btn btn-primary" onclick="window.location.hash='battle'">Enter Battle</button>
          </div>
          
          <div class="section-card">
            <div class="section-icon">🛒</div>
            <h3>Shop</h3>
            <p>Buy and sell items with merchants</p>
            <button class="btn btn-primary" onclick="window.location.hash='shop'">Visit Shop</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function DialogView() {
  return `
    <div class="dialog-container">
      <div class="npc-portrait">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmY5ODAwIj4KICA8cGF0aCBkPSJNMTIgMnMtOCAyLTggMTAgOCAxMCA4IDEwUzIwIDEyIDEyIDJaIi8+CiAgPGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjEiIGZpbGw9IiMwMDAiLz4KICA8Y2lyY2xlIGN4PSIxNSIgY3k9IjkiIHI9IjEiIGZpbGw9IiMwMDAiLz4KICA8cGF0aCBkPSJNOCAxMmE0IDQgMCAwIDAgOCAwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo8L3N2Zz4=" alt="Welcome NPC" />
        <span class="npc-name">Welcome Guide</span>
      </div>
      <div class="dialog-box">
        <div class="dialog-text">
          Welcome to Hero's Dawn! I'm here to help you get started on your adventure. 
          Use the navigation buttons on the left to explore different areas of the game. 
          Your character information is displayed in the left panel, and you can manage your 
          inventory, take on quests, engage in battles, and visit the shop.
        </div>
        <div class="dialog-controls">
          <button class="btn btn-primary" id="dialogNextBtn">Continue</button>
        </div>
      </div>
    </div>
  `;
}

// === Router Setup ===
const routes = {
  "": () => tutorialDone ? DashboardView() : DialogView(),
  "quests": () => QuestsView ? QuestsView() : `<div class="error-view">Quests view not available</div>`,
  "inventory": () => InventoryView ? InventoryView() : `<div class="error-view">Inventory view not available</div>`,
  "battle": () => BattleView ? BattleView() : `<div class="error-view">Battle view not available</div>`,
  "shop": () => ShopView ? ShopView() : `<div class="error-view">Shop view not available</div>`
};

function setupRouter() {
  // Navigation buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const section = button.getAttribute('data-section');
      if (section) {
        window.location.hash = section;
      }
    });
  });

  // Handle hash changes
  window.addEventListener('hashchange', router);
}

function router() {
  const hash = window.location.hash.replace("#", "");
  const view = routes[hash] || routes[""];
  
  if (gameContent) {
    try {
      gameContent.innerHTML = view();

      // Handle tutorial completion
      if (!tutorialDone && hash === "") {
        const btn = document.getElementById("dialogNextBtn");
        if (btn) {
          btn.addEventListener("click", () => {
            tutorialDone = true;
            localStorage.setItem("tutorialDone", "true");
            showNotification("Tutorial completed!", "success");
            router();
          });
        }
      }

      // Handle back buttons
      const backBtn = document.getElementById("backButton");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          window.location.hash = "";
        });
      }

      // Initialize view-specific functionality
      initializeCurrentView(hash);

    } catch (error) {
      console.error("Error rendering view:", error);
      gameContent.innerHTML = `<div class="error-view">Error loading view: ${error.message}</div>`;
    }
  } else {
    console.error("gameContent element not found!");
  }
}

function initializeCurrentView(hash) {
  // Initialize view-specific functionality
  switch (hash) {
    case "shop":
      // Initialize shop if available
      if (window.initShop && typeof window.initShop === 'function') {
        window.initShop();
      }
      break;
    case "inventory":
      // Initialize inventory if available
      if (window.initInventory && typeof window.initInventory === 'function') {
        window.initInventory();
      }
      break;
    case "quests":
      // Initialize quests if available
      if (window.initQuestView && typeof window.initQuestView === 'function') {
        window.initQuestView();
      }
      break;
    case "battle":
      // Initialize battle if available
      if (window.initBattle && typeof window.initBattle === 'function') {
        window.initBattle();
      }
      break;
  }
}

// === Save/Load System ===
function saveGame() {
  const gameData = {
    playerData,
    stats,
    tutorialDone,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem("herosDawnSave", JSON.stringify(gameData));
    updateSaveStatus("Auto-saved");
    return true;
  } catch (error) {
    console.error("Failed to save game:", error);
    updateSaveStatus("Save failed");
    return false;
  }
}

function loadGame() {
  try {
    const savedData = localStorage.getItem("herosDawnSave");
    if (savedData) {
      const gameData = JSON.parse(savedData);
      
      // Merge saved data
      Object.assign(playerData, gameData.playerData || {});
      Object.assign(stats, gameData.stats || {});
      tutorialDone = gameData.tutorialDone || false;
      
      // Update displays
      updateCharacterDisplay();
      updateBars();
      updateGoldDisplay();
      
      return true;
    }
  } catch (error) {
    console.error("Failed to load game:", error);
  }
  return false;
}

function updateSaveStatus(message) {
  const statusElement = document.getElementById("saveStatusText");
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// Auto-save every 30 seconds
setInterval(() => {
  saveGame();
}, 30000);

// Load game on startup
window.addEventListener('load', () => {
  loadGame();
});

// === Utility Functions ===
export function updatePlayerStat(statName, value) {
  if (stats.hasOwnProperty(statName)) {
    stats[statName] = value;
    updateCharacterDisplay();
    updateBars();
    saveGame();
  }
}

export function addGold(amount) {
  stats.gold += amount;
  updateGoldDisplay();
  saveGame();
  return stats.gold;
}

export function removeGold(amount) {
  if (stats.gold >= amount) {
    stats.gold -= amount;
    updateGoldDisplay();
    saveGame();
    return true;
  }
  return false;
}

export function getPlayerGold() {
  return stats.gold;
}

// === Initialize Debug Console Commands (Development) ===
if (typeof window !== 'undefined') {
  window.gameDebug = {
    addGold: (amount) => addGold(amount),
    setHP: (amount) => {
      stats.hp.current = Math.min(amount, stats.hp.max);
      updateBars();
    },
    resetTutorial: () => {
      localStorage.removeItem("tutorialDone");
      tutorialDone = false;
      router();
    },
    showStats: () => console.table(stats),
    resetGame: () => {
      localStorage.clear();
      location.reload();
    }
  };
}
