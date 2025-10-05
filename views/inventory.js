// Constants for inventory layout
const INVENTORY_SLOTS = 30; // Total available inventory slots
const GOLD_ICON = "💰";

export default function InventoryView() {
  // Mock data for UI display only
  const mockInventory = [
    {
      id: "sword_iron",
      name: "Iron Sword",
      type: "weapon",
      icon: "🗡️",
      variant: "common",
      atk: 12,
      equipped: true,
      count: 1,
    },
    {
      id: "armor_leather",
      name: "Leather Armor",
      type: "armor",
      icon: "🛡️",
      variant: "common",
      def: 5,
      equipped: true,
      count: 1,
    },
    {
      id: "potion_health",
      name: "Health Potion",
      type: "potion",
      icon: "🧪",
      variant: "rare",
      hpRestore: 50,
      count: 3,
    },
    {
      id: "food_bread",
      name: "Bread",
      type: "food",
      icon: "🍞",
      variant: "common",
      count: 5,
    },
    {
      id: "material_iron",
      name: "Iron Ore",
      type: "material",
      icon: "🪨",
      variant: "common",
      count: 12,
    },
  ];

  const mockGold = 250;
  const equippedItems = mockInventory.filter((item) => item.equipped);

  // Group items by category for sidebar
  const itemsByCategory = {
    weapons: mockInventory.filter((item) => item.type === "weapon"),
    armor: mockInventory.filter((item) => item.type === "armor"),
    potions: mockInventory.filter((item) => item.type === "potion"),
    food: mockInventory.filter((item) => item.type === "food"),
    materials: mockInventory.filter((item) => item.type === "material"),
    accessories: mockInventory.filter((item) => item.type === "accessory"),
    other: [],
  };

  const usedSlots = mockInventory.filter((item) => !item.equipped).length;

  return `
    <section class="inventory-view">
      <header class="inventory-header">
        <h2>🎒 Inventory</h2>
        <div class="inventory-controls">
          <div class="filter-controls">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="weapons">Weapons</button>
            <button class="filter-btn" data-filter="armor">Armor</button>
            <button class="filter-btn" data-filter="potions">Potions</button>
            <button class="filter-btn" data-filter="food">Food</button>
            <button class="filter-btn" data-filter="materials">Materials</button>
            <button class="filter-btn" data-filter="other">Other</button>
          </div>
          <div class="sort-controls">
            <select id="sortSelect" aria-label="Sort items">
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="type">Type</option>
              <option value="value">Value</option>
            </select>
          </div>
        </div>
      </header>
      
      <div class="inventory-layout">
        <!-- Left Side: Equipment Panel -->
        <div class="equipment-panel">
          <h3 class="panel-title">Equipment</h3>
          <div class="equipment-slots">
            <!-- Weapon Slot -->
            <div class="equipment-slot weapon-slot" data-slot-type="weapon">
              ${
                renderEquippedItem(
                  equippedItems.find((item) => item.type === "weapon")
                ) ||
                `<div class="empty-slot"><span class="slot-icon">🗡️</span><span class="slot-label">Weapon</span></div>`
              }
            </div>
            
            <!-- Armor Slot -->
            <div class="equipment-slot armor-slot" data-slot-type="armor">
              ${
                renderEquippedItem(
                  equippedItems.find((item) => item.type === "armor")
                ) ||
                `<div class="empty-slot"><span class="slot-icon">🛡️</span><span class="slot-label">Armor</span></div>`
              }
            </div>
            
            <!-- Accessory Slot -->
            <div class="equipment-slot accessory-slot" data-slot-type="accessory">
              ${
                renderEquippedItem(
                  equippedItems.find((item) => item.type === "accessory")
                ) ||
                `<div class="empty-slot"><span class="slot-icon">💍</span><span class="slot-label">Accessory</span></div>`
              }
            </div>
          </div>
          
          <!-- Gold Display -->
          <div class="gold-display">
            <span class="gold-icon">${GOLD_ICON}</span>
            <span class="gold-amount">${mockGold} Gold</span>
          </div>
          
          <!-- Character Stats -->
          <div class="character-stats">
            <h4 class="stats-title">Character Stats</h4>
            <div class="stat-row">
              <span class="stat-label">Attack:</span>
              <span class="stat-value" id="statAttack">17</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Defense:</span>
              <span class="stat-value" id="statDefense">7</span>
            </div>
          </div>
        </div>
        
        <!-- Center: Inventory Slots Grid -->
        <div class="inventory-container">
          <h3 class="panel-title">Items (${usedSlots}/${INVENTORY_SLOTS} slots)</h3>
          <div class="inventory-slots-grid">
            ${generateInventorySlots(mockInventory, INVENTORY_SLOTS)}
          </div>
        </div>
        
        <!-- Right Side: Category Sidebar -->
        <div class="inventory-sidebar">
          <h3 class="panel-title">Categories</h3>
          <ul class="category-list">
            <li class="category-item" data-category="weapons">
              <span class="category-icon">🗡️</span>
              <span class="category-name">Weapons</span>
              <span class="category-count">${
                itemsByCategory.weapons.length
              }</span>
            </li>
            <li class="category-item" data-category="armor">
              <span class="category-icon">🛡️</span>
              <span class="category-name">Armor</span>
              <span class="category-count">${
                itemsByCategory.armor.length
              }</span>
            </li>
            <li class="category-item" data-category="potions">
              <span class="category-icon">🧪</span>
              <span class="category-name">Potions</span>
              <span class="category-count">${itemsByCategory.potions.reduce(
                (total, item) => total + (item.count || 1),
                0
              )}</span>
            </li>
            <li class="category-item" data-category="food">
              <span class="category-icon">🍖</span>
              <span class="category-name">Food</span>
              <span class="category-count">${itemsByCategory.food.reduce(
                (total, item) => total + (item.count || 1),
                0
              )}</span>
            </li>
            <li class="category-item" data-category="materials">
              <span class="category-icon">📦</span>
              <span class="category-name">Materials</span>
              <span class="category-count">${itemsByCategory.materials.reduce(
                (total, item) => total + (item.count || 1),
                0
              )}</span>
            </li>
            <li class="category-item" data-category="accessories">
              <span class="category-icon">💍</span>
              <span class="category-name">Accessories</span>
              <span class="category-count">${
                itemsByCategory.accessories.length
              }</span>
            </li>
            <li class="category-item" data-category="other">
              <span class="category-icon">❓</span>
              <span class="category-name">Other</span>
              <span class="category-count">${
                itemsByCategory.other.length
              }</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Item Details Panel (Hidden by default) -->
      <div class="item-details-panel" id="itemDetailsPanel" style="display: none;">
        <div class="details-header">
          <h3 id="detailsItemName">Iron Sword</h3>
          <button class="close-details-btn" id="closeDetailsBtn" aria-label="Close details">×</button>
        </div>
        <div class="details-content">
          <div class="details-image">
            <div class="item-image" id="detailsItemImage">🗡️</div>
            <div class="item-rarity" id="detailsItemRarity">Common</div>
          </div>
          <div class="details-info">
            <p id="detailsItemDescription">A basic sword forged from iron. Reliable but unremarkable.</p>
            <div class="details-stats" id="detailsItemStats">
              <div class="stat-row">
                <span class="stat-label">Type:</span>
                <span class="stat-value">Weapon</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Attack:</span>
                <span class="stat-value">+12</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Value:</span>
                <span class="stat-value">50 Gold</span>
              </div>
            </div>
            <div class="stack-info" id="stackInfo">
              <div class="stack-info-text">This item cannot be stacked</div>
            </div>
          </div>
        </div>
        <div class="details-actions">
          <button class="btn btn-action" id="itemUseBtn">Use</button>
          <button class="btn btn-action" id="itemEquipBtn">Equip</button>
          <button class="btn btn-action" id="itemSplitBtn">Split Stack</button>
          <button class="btn btn-action btn-danger" id="itemDiscardBtn">Discard</button>
        </div>
      </div>
      
      <footer class="inventory-footer">
        <button class="btn back-btn" id="backButton" aria-label="Return to dashboard">
          <span class="btn-icon">⬅️</span>
          <span>Back</span>
        </button>
      </footer>
    </section>
  `;
}

// Helper function to render an equipped item (UI only)
function renderEquippedItem(item) {
  if (!item) return "";

  const rarityClass = item.variant || "common";

  return `
    <div class="equipped-item ${rarityClass}" data-item-id="${item.id}">
      <div class="item-icon">${item.icon}</div>
      <div class="item-name">${item.name}</div>
      <div class="item-stat">${
        item.type === "weapon"
          ? `+${item.atk} ATK`
          : item.type === "armor"
          ? `+${item.def} DEF`
          : ""
      }</div>
      ${
        item.durability
          ? `
        <div class="durability-bar">
          <div class="durability-fill" style="width: 85%"></div>
        </div>`
          : ""
      }
    </div>
  `;
}

// Generate the slot grid HTML (UI only)
function generateInventorySlots(inventory, totalSlots) {
  const nonEquippedItems = inventory.filter((item) => !item.equipped);
  let slotsHTML = "";

  // Generate HTML for each slot
  for (let i = 0; i < totalSlots; i++) {
    if (i < nonEquippedItems.length) {
      slotsHTML += renderInventorySlot(nonEquippedItems[i], i);
    } else {
      slotsHTML += `
        <div class="inventory-slot empty-slot" data-slot-index="${i}">
          <div class="slot-number">${i + 1}</div>
        </div>
      `;
    }
  }

  return slotsHTML;
}

// Render a single inventory slot (UI only)
function renderInventorySlot(item, slotIndex) {
  if (!item) {
    return `<div class="inventory-slot empty-slot" data-slot-index="${slotIndex}"></div>`;
  }

  const rarityClass = item.variant || "common";
  const typeClass = `item-type-${item.type}`;

  return `
    <div class="inventory-slot ${rarityClass} ${typeClass}" 
         data-item-id="${item.id}" 
         data-item-type="${item.type}" 
         data-slot-index="${slotIndex}" 
         data-item-rarity="${item.variant || "common"}">
      <div class="slot-number">${slotIndex + 1}</div>
      <div class="slot-content">
        <div class="item-icon">${item.icon}</div>
        <div class="item-name">${item.name}</div>
        ${item.count > 1 ? `<div class="stack-count">${item.count}</div>` : ""}
      </div>
    </div>
  `;
}

// Initialize inventory UI only (no functionality)
export function initInventory() {
  console.log("Inventory UI initialized (display only)");

  // You can add basic UI interactions here like:
  // - Visual hover effects
  // - Click animations
  // - Modal show/hide
  // - Filter button active states
  // - Sort dropdown changes

  // Example: Basic click handlers for UI feedback only
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document
    .querySelectorAll(".inventory-slot:not(.empty-slot)")
    .forEach((slot) => {
      slot.addEventListener("click", () => {
        document.getElementById("itemDetailsPanel").style.display = "block";
      });
    });

  document.getElementById("closeDetailsBtn")?.addEventListener("click", () => {
    document.getElementById("itemDetailsPanel").style.display = "none";
  });

  document.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".category-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}
