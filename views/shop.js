import {
  ITEM_TYPES,
  RARITY,
  Items,
  AllItems,
  playerInventory,
  addItemToInventory,
  saveInventory,
} from "../data/item.js";
import { showNotification } from "../scripts/demo.js";

// Shop Tabs
const SHOP_TABS = [
  { id: "all", name: "All Items", icon: "🛒" },
  { id: "weapons", name: "Weapons", icon: "🗡️" },
  { id: "armor", name: "Armor", icon: "🛡️" },
  { id: "potions", name: "Potions", icon: "🧪" },
  { id: "accessories", name: "Accessories", icon: "💍" },
  { id: "materials", name: "Materials", icon: "📦" },
];

let activeTab = "all";
let shopInventory = []; // keep persistent until refresh

// Helper functions for gold management
function getGold() {
  return playerInventory.gold || 0;
}

function removeGold(amount) {
  if (playerInventory.gold >= amount) {
    playerInventory.gold -= amount;
    updateGoldDisplay();
    return true;
  }
  return false;
}

function addGold(amount) {
  playerInventory.gold = (playerInventory.gold || 0) + amount;
  updateGoldDisplay();
}

function updateGoldDisplay() {
  const goldElement = document.querySelector(".gold-amount");
  if (goldElement) {
    goldElement.textContent = `${getGold()} Gold`;
  }

  // Update top header gold display if exists
  const topGoldElement = document.getElementById("topGold");
  if (topGoldElement) {
    topGoldElement.textContent = getGold();
  }
}

// Main Shop View
export default function ShopView() {
  const playerGold = getGold();
  if (shopInventory.length === 0) {
    shopInventory = generateShopInventory();
  }
  const filteredItems = filterItemsByTab(shopInventory, activeTab);

  return `
  <section class="shop-view">
    <header class="shop-header">
      <h2>🛒 Merchant Shop</h2>
      <div class="player-gold">
        <span class="gold-icon">💰</span>
        <span class="gold-amount">${playerGold} Gold</span>
      </div>
    </header>

    <div class="shop-tabs">
      ${SHOP_TABS.map(
        (tab) => `
        <button class="shop-tab ${
          activeTab === tab.id ? "active" : ""
        }" data-tab="${tab.id}">
          <span class="tab-icon">${tab.icon}</span>
          <span class="tab-name">${tab.name}</span>
        </button>
      `
      ).join("")}
    </div>

    <div class="shop-content">
      <div class="shop-grid">
        ${renderShopGrid(filteredItems)}
      </div>
    </div>

    <!-- Modal -->
    <div class="shop-item-modal" id="shopItemModal" style="display:none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modalItemName">Item Name</h3>
          <button class="close-modal-btn" id="closeModalBtn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="item-preview">
            <div class="item-icon" id="modalItemIcon">🗡️</div>
            <div class="item-rarity" id="modalItemRarity">Common</div>
          </div>
          <div class="item-details">
            <p class="item-description" id="modalItemDescription"></p>
            <div class="item-stats" id="modalItemStats"></div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="item-price" id="modalItemPrice">
            <span class="price-icon">💰</span>
            <span class="price-amount">50 Gold</span>
          </div>
          <button class="buy-btn" id="modalBuyBtn">Buy Item</button>
        </div>
      </div>
    </div>

    <footer class="shop-footer">
      <button class="btn refresh-btn" id="refreshShopBtn">
        <span class="btn-icon">🔄</span>
        <span>Refresh (20 Gold)</span>
      </button>
      <button class="btn back-btn" id="backButton">
        <span class="btn-icon">⬅️</span>
        <span>Back</span>
      </button>
    </footer>
  </section>
  `;
}

// Generate shop inventory with 10 random slots
function generateShopInventory() {
  try {
    // Create mock shop items if Items is not available
    let allItems = [];

    if (Items && typeof Items === "object") {
      allItems = [
        ...(Items.weapons || []),
        ...(Items.armors || []),
        ...(Items.potions || []),
        ...(Items.accessories || []),
        ...(Items.materials || []),
      ];
    }

    // Fallback to mock items if no items available
    if (allItems.length === 0) {
      allItems = createMockShopItems();
    }

    const shopItems = allItems.map((item) => ({
      ...item,
      price: item.value || getDefaultPrice(item.type),
    }));

    const shuffled = shopItems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  } catch (error) {
    console.warn("Error generating shop inventory, using fallback:", error);
    return createMockShopItems().slice(0, 10);
  }
}

function createMockShopItems() {
  return [
    {
      id: "shop_sword",
      name: "Iron Sword",
      type: ITEM_TYPES.WEAPON,
      icon: "🗡️",
      variant: "common",
      atk: 12,
      durability: 30,
      description: "A reliable iron sword.",
      price: 50,
    },
    {
      id: "shop_armor",
      name: "Leather Armor",
      type: ITEM_TYPES.ARMOR,
      icon: "🛡️",
      variant: "common",
      def: 8,
      durability: 25,
      description: "Basic leather protection.",
      price: 40,
    },
    {
      id: "shop_potion",
      name: "Health Potion",
      type: ITEM_TYPES.POTION,
      icon: "🧪",
      variant: "common",
      hpRestore: 50,
      description: "Restores health points.",
      price: 15,
    },
    {
      id: "shop_ring",
      name: "Simple Ring",
      type: ITEM_TYPES.ACCESSORY,
      icon: "💍",
      variant: "common",
      description: "A basic accessory.",
      price: 30,
    },
    {
      id: "shop_material",
      name: "Iron Ore",
      type: ITEM_TYPES.MATERIAL,
      icon: "📦",
      variant: "common",
      description: "Raw crafting material.",
      price: 5,
    },
  ];
}

function getDefaultPrice(type) {
  switch (type) {
    case ITEM_TYPES.WEAPON:
      return 50;
    case ITEM_TYPES.ARMOR:
      return 40;
    case ITEM_TYPES.POTION:
      return 15;
    case ITEM_TYPES.ACCESSORY:
      return 100;
    case ITEM_TYPES.MATERIAL:
      return 5;
    default:
      return 20;
  }
}

// Filter by tab
function filterItemsByTab(items, tabId) {
  if (tabId === "all") return items;
  const typeMap = {
    weapons: ITEM_TYPES.WEAPON,
    armor: ITEM_TYPES.ARMOR,
    potions: ITEM_TYPES.POTION,
    accessories: ITEM_TYPES.ACCESSORY,
    materials: ITEM_TYPES.MATERIAL,
  };
  return items.filter((i) => i.type === typeMap[tabId]);
}

// Render shop grid with 10 slots
function renderShopGrid(items) {
  const totalSlots = 10;
  const filledSlots = items.map(renderShopItem).join("");
  const emptySlots = Array(Math.max(0, totalSlots - items.length))
    .fill(0)
    .map(renderEmptySlot)
    .join("");

  return filledSlots + emptySlots;
}

function renderShopItem(item) {
  const rarityClass = item.variant || "common";
  const icon = item.icon || getItemTypeIcon(item.type);
  return `
    <div class="shop-item ${rarityClass}" data-item-id="${item.id}">
      <div class="item-icon">${icon}</div>
      <div class="item-info">
        <h3 class="item-name">${item.name}</h3>
        <div class="item-meta">
          <span class="item-type">${capitalize(item.type)}</span>
          <span class="item-rarity">${getRarityName(item.variant)}</span>
        </div>
      </div>
      <div class="item-price">
        <span class="price-icon">💰</span>
        <span class="price-amount">${item.price}</span>
      </div>
      <button class="item-action view-btn" data-item-id="${
        item.id
      }">View</button>
    </div>
  `;
}

function renderEmptySlot() {
  return `
    <div class="shop-item empty-slot">
      <div class="item-icon">❔</div>
      <div class="item-info">
        <h3 class="item-name">Empty</h3>
        <div class="item-meta">—</div>
      </div>
    </div>
  `;
}

// Helpers
function getItemTypeIcon(type) {
  const icons = {
    [ITEM_TYPES.WEAPON]: "🗡️",
    [ITEM_TYPES.ARMOR]: "🛡️",
    [ITEM_TYPES.POTION]: "🧪",
    [ITEM_TYPES.ACCESSORY]: "💍",
    [ITEM_TYPES.MATERIAL]: "📦",
  };
  return icons[type] || "📦";
}

function getRarityName(r) {
  const map = {
    common: "Common",
    rare: "Rare",
    epic: "Epic",
    legendary: "Legendary",
    mythic: "Mythic",
  };
  return map[r] || "Common";
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// Init shop
export function initShop() {
  // Update gold display when shop loads
  updateGoldDisplay();

  // Tabs
  document.querySelectorAll(".shop-tab").forEach((tab) => {
    tab.onclick = () => {
      activeTab = tab.dataset.tab;

      // Update active tab
      document
        .querySelectorAll(".shop-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Re-render content
      const shopContent = document.querySelector(".shop-content .shop-grid");
      if (shopContent) {
        const filteredItems = filterItemsByTab(shopInventory, activeTab);
        shopContent.innerHTML = renderShopGrid(filteredItems);

        // Re-bind events for new items
        bindShopItemEvents();
      }
    };
  });

  bindShopItemEvents();
  bindModalEvents();
}

function bindShopItemEvents() {
  // View item
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const itemId = btn.dataset.itemId;
      if (itemId) {
        showItemDetails(itemId);
      }
    };
  });

  document.querySelectorAll(".shop-item:not(.empty-slot)").forEach((item) => {
    item.onclick = (e) => {
      if (!e.target.classList.contains("view-btn")) {
        const itemId = item.dataset.itemId;
        if (itemId) {
          showItemDetails(itemId);
        }
      }
    };
  });

  // Refresh
  const refreshBtn = document.getElementById("refreshShopBtn");
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      const refreshCost = 20;
      if (getGold() < refreshCost) {
        showNotification("Not enough gold to refresh!", "error");
        return;
      }

      if (removeGold(refreshCost)) {
        shopInventory = generateShopInventory();

        // Re-render shop
        const shopGrid = document.querySelector(".shop-content .shop-grid");
        if (shopGrid) {
          const filteredItems = filterItemsByTab(shopInventory, activeTab);
          shopGrid.innerHTML = renderShopGrid(filteredItems);
          bindShopItemEvents();
        }

        showNotification("Shop refreshed!", "success");
        saveInventory();
      }
    };
  }
}

function bindModalEvents() {
  // Close modal
  const modal = document.getElementById("shopItemModal");
  const closeBtn = document.getElementById("closeModalBtn");

  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }

  // Buy button
  const buyBtn = document.getElementById("modalBuyBtn");
  if (buyBtn) {
    buyBtn.onclick = () => {
      const itemId = buyBtn.dataset.itemId;
      if (itemId) {
        purchaseItem(itemId);
      }
    };
  }
}

// Show item details modal
function showItemDetails(itemId) {
  const item = shopInventory.find((i) => i.id === itemId);
  if (!item) {
    console.warn("Item not found:", itemId);
    return;
  }

  const modal = document.getElementById("shopItemModal");
  if (!modal) {
    console.error("Shop modal not found");
    return;
  }

  // Update modal content
  const elements = {
    name: document.getElementById("modalItemName"),
    description: document.getElementById("modalItemDescription"),
    icon: document.getElementById("modalItemIcon"),
    rarity: document.getElementById("modalItemRarity"),
    stats: document.getElementById("modalItemStats"),
    price: document.getElementById("modalItemPrice"),
    buyBtn: document.getElementById("modalBuyBtn"),
  };

  if (elements.name) elements.name.textContent = item.name;
  if (elements.description)
    elements.description.textContent =
      item.description || "No description available.";
  if (elements.icon)
    elements.icon.textContent = item.icon || getItemTypeIcon(item.type);

  if (elements.rarity) {
    elements.rarity.textContent = getRarityName(item.variant);
    elements.rarity.className = `item-rarity ${item.variant || "common"}`;
  }

  // Build stats HTML
  let statsHTML = "";
  if (item.type === ITEM_TYPES.WEAPON) {
    if (item.atk)
      statsHTML += `<div class="stat-row">Attack: +${item.atk}</div>`;
    if (item.durability)
      statsHTML += `<div class="stat-row">Durability: ${item.durability}</div>`;
  } else if (item.type === ITEM_TYPES.ARMOR) {
    if (item.def)
      statsHTML += `<div class="stat-row">Defense: +${item.def}</div>`;
    if (item.durability)
      statsHTML += `<div class="stat-row">Durability: ${item.durability}</div>`;
  } else if (item.type === ITEM_TYPES.POTION) {
    if (item.hpRestore)
      statsHTML += `<div class="stat-row">HP +${item.hpRestore}</div>`;
    if (item.mpRestore)
      statsHTML += `<div class="stat-row">MP +${item.mpRestore}</div>`;
  }

  if (elements.stats) elements.stats.innerHTML = statsHTML;

  // Update price
  if (elements.price) {
    const priceAmount = elements.price.querySelector(".price-amount");
    if (priceAmount) priceAmount.textContent = `${item.price} Gold`;
  }

  // Update buy button
  if (elements.buyBtn) {
    elements.buyBtn.dataset.itemId = item.id;
    const canAfford = getGold() >= item.price;
    elements.buyBtn.disabled = !canAfford;
    elements.buyBtn.textContent = canAfford ? "Buy Item" : "Not Enough Gold";
    elements.buyBtn.className = canAfford ? "buy-btn" : "buy-btn disabled";
  }

  modal.style.display = "block";
}

// Purchase item
function purchaseItem(itemId) {
  const itemIndex = shopInventory.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) {
    showNotification("Item not found!", "error");
    return;
  }

  const item = shopInventory[itemIndex];

  if (getGold() < item.price) {
    showNotification("Not enough gold!", "error");
    return;
  }

  if (!removeGold(item.price)) {
    showNotification("Failed to deduct gold!", "error");
    return;
  }

  // Add to inventory
  try {
    const success = addItemToInventory(item.id);
    if (!success) {
      // Refund if inventory add failed
      addGold(item.price);
      showNotification("Inventory full!", "error");
      return;
    }
  } catch (error) {
    // Refund if error occurred
    addGold(item.price);
    showNotification("Error adding item to inventory!", "error");
    console.error("Purchase error:", error);
    return;
  }

  // Remove item from shop
  shopInventory.splice(itemIndex, 1);

  // Save progress
  saveInventory();

  showNotification(`Purchased ${item.name} for ${item.price} gold!`, "success");

  // Close modal
  const modal = document.getElementById("shopItemModal");
  if (modal) modal.style.display = "none";

  // Re-render shop grid
  const shopGrid = document.querySelector(".shop-content .shop-grid");
  if (shopGrid) {
    const filteredItems = filterItemsByTab(shopInventory, activeTab);
    shopGrid.innerHTML = renderShopGrid(filteredItems);
    bindShopItemEvents();
  }
}

// Auto-initialize when view loads
setTimeout(() => {
  if (document.querySelector(".shop-view")) {
    initShop();
  }
}, 100);
