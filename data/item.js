/**
 * Optimized Item System for Hero's Dawn
 * Features: Better performance, type safety, extensibility, and maintainability
 */

// ===============================
// CORE CONSTANTS & ENUMS
// ===============================

export const ITEM_TYPES = Object.freeze({
  WEAPON: "weapon",
  ARMOR: "armor",
  POTION: "potion",
  FOOD: "food",
  ACCESSORY: "accessory",
  MATERIAL: "material",
  GOLD: "gold",
});

export const RARITY = Object.freeze({
  COMMON: {
    id: "common",
    name: "Common",
    color: "#9e9e9e",
    dropChance: 60,
    statMultiplier: 1.0,
    valueMultiplier: 1.0,
    glowColor: "rgba(158, 158, 158, 0.3)",
  },
  RARE: {
    id: "rare",
    name: "Rare",
    color: "#2196f3",
    dropChance: 25,
    statMultiplier: 1.5,
    valueMultiplier: 2.0,
    glowColor: "rgba(33, 150, 243, 0.5)",
  },
  EPIC: {
    id: "epic",
    name: "Epic",
    color: "#9c27b0",
    dropChance: 10,
    statMultiplier: 2.0,
    valueMultiplier: 5.0,
    glowColor: "rgba(156, 39, 176, 0.6)",
  },
  LEGENDARY: {
    id: "legendary",
    name: "Legendary",
    color: "#ff9800",
    dropChance: 4,
    statMultiplier: 3.0,
    valueMultiplier: 12.0,
    glowColor: "rgba(255, 152, 0, 0.7)",
  },
  MYTHIC: {
    id: "mythic",
    name: "Mythic",
    color: "#f44336",
    dropChance: 1,
    statMultiplier: 4.0,
    valueMultiplier: 25.0,
    glowColor: "rgba(244, 67, 54, 0.8)",
  },
});

export const EQUIPMENT_SLOTS = Object.freeze({
  MAIN_HAND: "mainHand",
  OFF_HAND: "offHand",
  HEAD: "head",
  CHEST: "chest",
  LEGS: "legs",
  FEET: "feet",
  ACCESSORY_1: "accessory1",
  ACCESSORY_2: "accessory2",
});

export const MAX_STACK = Object.freeze({
  [ITEM_TYPES.WEAPON]: 1,
  [ITEM_TYPES.ARMOR]: 1,
  [ITEM_TYPES.ACCESSORY]: 1,
  [ITEM_TYPES.POTION]: 64,
  [ITEM_TYPES.FOOD]: 64,
  [ITEM_TYPES.MATERIAL]: 99,
  [ITEM_TYPES.GOLD]: Infinity,
});

// ===============================
// ITEM TEMPLATES & FACTORIES
// ===============================

class ItemTemplate {
  constructor({
    id,
    name,
    type,
    rarity = RARITY.COMMON,
    value = 0,
    description = "",
    icon = "📦",
    level = 1,
    durability = null,
    ...stats
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.rarity = rarity;
    this.value = Math.floor(value * rarity.valueMultiplier);
    this.description = description;
    this.icon = icon;
    this.level = level;
    this.durability = durability;
    this.stats = this.#processStats(stats, rarity);

    // Freeze the template to prevent mutations
    Object.freeze(this);
  }

  #processStats(stats, rarity) {
    const processed = {};

    // Apply rarity multiplier to numeric stats
    for (const [key, value] of Object.entries(stats)) {
      if (typeof value === "number") {
        processed[key] = Math.floor(value * rarity.statMultiplier);
      } else {
        processed[key] = value;
      }
    }

    return Object.freeze(processed);
  }

  createInstance(overrides = {}) {
    return new ItemInstance(this, overrides);
  }
}

class ItemInstance {
  constructor(template, overrides = {}) {
    // Copy template properties
    Object.assign(this, template);

    // Add instance-specific properties
    this.instanceId = this.#generateInstanceId();
    this.currentDurability = template.durability || null;
    this.equipped = false;
    this.count = 1;
    this.createdAt = Date.now();

    // Apply any overrides
    Object.assign(this, overrides);

    // Validate instance
    this.#validate();
  }

  #generateInstanceId() {
    return `${this.id}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  #validate() {
    if (!this.id || !this.name || !this.type) {
      throw new Error("Invalid item instance: missing required properties");
    }

    if (this.count < 0) {
      this.count = 0;
    }

    if (this.currentDurability !== null && this.currentDurability < 0) {
      this.currentDurability = 0;
    }
  }

  // Utility methods
  canStack() {
    return MAX_STACK[this.type] > 1;
  }

  isBroken() {
    return this.currentDurability === 0;
  }

  getDurabilityPercent() {
    if (!this.durability) return 100;
    return Math.floor((this.currentDurability / this.durability) * 100);
  }

  repair(amount = null) {
    if (!this.durability) return false;

    const repairAmount = amount || this.durability;
    this.currentDurability = Math.min(
      this.currentDurability + repairAmount,
      this.durability
    );
    return true;
  }

  clone() {
    return new ItemInstance(this, {
      instanceId: this.#generateInstanceId(),
      createdAt: Date.now(),
    });
  }

  toJSON() {
    return {
      instanceId: this.instanceId,
      id: this.id,
      name: this.name,
      type: this.type,
      rarity: this.rarity,
      value: this.value,
      description: this.description,
      icon: this.icon,
      level: this.level,
      durability: this.durability,
      currentDurability: this.currentDurability,
      stats: this.stats,
      equipped: this.equipped,
      count: this.count,
      createdAt: this.createdAt,
    };
  }
}

// ===============================
// ITEM REGISTRY & CACHE
// ===============================

class ItemRegistry {
  constructor() {
    this.templates = new Map();
    this.categories = new Map();
    this.cache = {
      byType: new Map(),
      byRarity: new Map(),
      byLevel: new Map(),
    };
  }

  register(template) {
    if (!(template instanceof ItemTemplate)) {
      throw new Error("Only ItemTemplate instances can be registered");
    }

    this.templates.set(template.id, template);
    this.#updateCache(template);
    this.#categorize(template);
  }

  #updateCache(template) {
    // Cache by type
    if (!this.cache.byType.has(template.type)) {
      this.cache.byType.set(template.type, []);
    }
    this.cache.byType.get(template.type).push(template);

    // Cache by rarity
    if (!this.cache.byRarity.has(template.rarity.id)) {
      this.cache.byRarity.set(template.rarity.id, []);
    }
    this.cache.byRarity.get(template.rarity.id).push(template);

    // Cache by level range
    const levelRange = Math.floor(template.level / 10) * 10;
    if (!this.cache.byLevel.has(levelRange)) {
      this.cache.byLevel.set(levelRange, []);
    }
    this.cache.byLevel.get(levelRange).push(template);
  }

  #categorize(template) {
    if (!this.categories.has(template.type)) {
      this.categories.set(template.type, []);
    }
    this.categories.get(template.type).push(template);
  }

  get(id) {
    return this.templates.get(id);
  }

  getByType(type) {
    return this.cache.byType.get(type) || [];
  }

  getByRarity(rarity) {
    return this.cache.byRarity.get(rarity) || [];
  }

  getByLevelRange(minLevel, maxLevel) {
    const items = [];
    for (const template of this.templates.values()) {
      if (template.level >= minLevel && template.level <= maxLevel) {
        items.push(template);
      }
    }
    return items;
  }

  createItem(id, overrides = {}) {
    const template = this.get(id);
    if (!template) {
      throw new Error(`Item template '${id}' not found`);
    }
    return template.createInstance(overrides);
  }

  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  clear() {
    this.templates.clear();
    this.categories.clear();
    this.cache.byType.clear();
    this.cache.byRarity.clear();
    this.cache.byLevel.clear();
  }
}

// Global registry instance
export const itemRegistry = new ItemRegistry();

// ===============================
// ITEM DEFINITIONS
// ===============================

const WEAPON_TEMPLATES = [
  new ItemTemplate({
    id: "sword_iron",
    name: "Iron Sword",
    type: ITEM_TYPES.WEAPON,
    rarity: RARITY.COMMON,
    value: 50,
    description: "A basic sword forged from iron. Reliable but unremarkable.",
    icon: "🗡️",
    level: 1,
    durability: 30,
    atk: 12,
    slot: EQUIPMENT_SLOTS.MAIN_HAND,
  }),

  new ItemTemplate({
    id: "sword_steel",
    name: "Steel Sword",
    type: ITEM_TYPES.WEAPON,
    rarity: RARITY.RARE,
    value: 120,
    description:
      "A well-crafted sword made of high-quality steel. Holds an edge well.",
    icon: "🗡️",
    level: 5,
    durability: 50,
    atk: 15,
    slot: EQUIPMENT_SLOTS.MAIN_HAND,
  }),

  new ItemTemplate({
    id: "blade_enchanted",
    name: "Enchanted Blade",
    type: ITEM_TYPES.WEAPON,
    rarity: RARITY.EPIC,
    value: 300,
    description:
      "A blade imbued with magical energies that increase its cutting power.",
    icon: "⚔️",
    level: 10,
    durability: 80,
    atk: 18,
    magicAtk: 5,
    slot: EQUIPMENT_SLOTS.MAIN_HAND,
  }),

  new ItemTemplate({
    id: "dragonslayer",
    name: "Dragon Slayer",
    type: ITEM_TYPES.WEAPON,
    rarity: RARITY.LEGENDARY,
    value: 800,
    description:
      "A legendary blade said to have been used to slay a dragon in ancient times.",
    icon: "⚔️",
    level: 20,
    durability: 120,
    atk: 22,
    critChance: 15,
    dragonSlayer: true,
    slot: EQUIPMENT_SLOTS.MAIN_HAND,
  }),

  new ItemTemplate({
    id: "excalibur",
    name: "Excalibur",
    type: ITEM_TYPES.WEAPON,
    rarity: RARITY.MYTHIC,
    value: 2000,
    description:
      "The mythical sword of kings. Its blade gleams with otherworldly light.",
    icon: "⚔️",
    level: 30,
    durability: 200,
    atk: 30,
    magicAtk: 15,
    critChance: 25,
    holyDamage: true,
    slot: EQUIPMENT_SLOTS.MAIN_HAND,
  }),
];

const ARMOR_TEMPLATES = [
  new ItemTemplate({
    id: "armor_leather",
    name: "Leather Armor",
    type: ITEM_TYPES.ARMOR,
    rarity: RARITY.COMMON,
    value: 45,
    description:
      "Basic armor made from tanned leather. Offers minimal protection.",
    icon: "🛡️",
    level: 1,
    durability: 25,
    def: 5,
    slot: EQUIPMENT_SLOTS.CHEST,
  }),

  new ItemTemplate({
    id: "armor_chainmail",
    name: "Chainmail",
    type: ITEM_TYPES.ARMOR,
    rarity: RARITY.RARE,
    value: 110,
    description:
      "Interlocking metal rings that provide good protection against slashing attacks.",
    icon: "🛡️",
    level: 5,
    durability: 40,
    def: 8,
    slashResist: 20,
    slot: EQUIPMENT_SLOTS.CHEST,
  }),

  new ItemTemplate({
    id: "armor_plate",
    name: "Plate Armor",
    type: ITEM_TYPES.ARMOR,
    rarity: RARITY.EPIC,
    value: 280,
    description:
      "Solid metal plates that offer excellent protection against physical attacks.",
    icon: "🛡️",
    level: 10,
    durability: 60,
    def: 12,
    physicalResist: 15,
    slot: EQUIPMENT_SLOTS.CHEST,
  }),

  new ItemTemplate({
    id: "armor_dragonscale",
    name: "Dragonscale Armor",
    type: ITEM_TYPES.ARMOR,
    rarity: RARITY.LEGENDARY,
    value: 750,
    description:
      "Armor forged from the scales of a slain dragon. Highly resistant to fire.",
    icon: "🛡️",
    level: 20,
    durability: 100,
    def: 16,
    fireResist: 50,
    slot: EQUIPMENT_SLOTS.CHEST,
  }),

  new ItemTemplate({
    id: "armor_celestial",
    name: "Celestial Platemail",
    type: ITEM_TYPES.ARMOR,
    rarity: RARITY.MYTHIC,
    value: 1800,
    description:
      "Armor forged from metals not of this world. Shimmers with divine protection.",
    icon: "🛡️",
    level: 30,
    durability: 150,
    def: 22,
    allResist: 25,
    holyProtection: true,
    slot: EQUIPMENT_SLOTS.CHEST,
  }),
];

const POTION_TEMPLATES = [
  new ItemTemplate({
    id: "potion_health_minor",
    name: "Minor Healing Potion",
    type: ITEM_TYPES.POTION,
    rarity: RARITY.COMMON,
    value: 15,
    description: "A small vial of red liquid that heals minor wounds.",
    icon: "🧪",
    level: 1,
    hpRestore: 30,
    usageType: "instant",
  }),

  new ItemTemplate({
    id: "potion_health_standard",
    name: "Healing Potion",
    type: ITEM_TYPES.POTION,
    rarity: RARITY.RARE,
    value: 40,
    description:
      "A standard healing potion that restores a moderate amount of health.",
    icon: "🧪",
    level: 10,
    hpRestore: 80,
    usageType: "instant",
  }),

  new ItemTemplate({
    id: "potion_health_greater",
    name: "Greater Healing Potion",
    type: ITEM_TYPES.POTION,
    rarity: RARITY.EPIC,
    value: 100,
    description: "A potent healing elixir that can heal even severe injuries.",
    icon: "🧪",
    level: 20,
    hpRestore: 200,
    usageType: "instant",
  }),

  new ItemTemplate({
    id: "potion_mana_minor",
    name: "Minor Mana Potion",
    type: ITEM_TYPES.POTION,
    rarity: RARITY.COMMON,
    value: 15,
    description:
      "A small vial of blue liquid that restores a small amount of magical energy.",
    icon: "🧪",
    level: 1,
    mpRestore: 20,
    usageType: "instant",
  }),

  new ItemTemplate({
    id: "potion_strength",
    name: "Potion of Strength",
    type: ITEM_TYPES.POTION,
    rarity: RARITY.EPIC,
    value: 75,
    description:
      "Temporarily increases physical strength, boosting attack power.",
    icon: "🧪",
    level: 15,
    atkBonus: 10,
    duration: 180,
    usageType: "buff",
  }),
];

const FOOD_TEMPLATES = [
  new ItemTemplate({
    id: "food_bread",
    name: "Bread",
    type: ITEM_TYPES.FOOD,
    rarity: RARITY.COMMON,
    value: 5,
    description: "Simple bread. Slightly restores health and stamina.",
    icon: "🍞",
    level: 1,
    hpRestore: 10,
    staminaRestore: 15,
    usageType: "instant",
  }),

  new ItemTemplate({
    id: "food_meat",
    name: "Grilled Meat",
    type: ITEM_TYPES.FOOD,
    rarity: RARITY.COMMON,
    value: 12,
    description: "Freshly grilled meat. Restores health and stamina.",
    icon: "🍖",
    level: 1,
    hpRestore: 20,
    staminaRestore: 25,
    usageType: "instant",
  }),

  new ItemTemplate({
    id: "food_stew",
    name: "Hearty Stew",
    type: ITEM_TYPES.FOOD,
    rarity: RARITY.RARE,
    value: 25,
    description:
      "A rich stew that restores health and temporarily increases defense.",
    icon: "🍲",
    level: 10,
    hpRestore: 40,
    staminaRestore: 35,
    defBonus: 5,
    duration: 300,
    usageType: "buff",
  }),
];

const ACCESSORY_TEMPLATES = [
  new ItemTemplate({
    id: "ring_health",
    name: "Ring of Vitality",
    type: ITEM_TYPES.ACCESSORY,
    rarity: RARITY.RARE,
    value: 150,
    description: "A magical ring that increases maximum health.",
    icon: "💍",
    level: 10,
    maxHpBonus: 25,
    slot: EQUIPMENT_SLOTS.ACCESSORY_1,
  }),

  new ItemTemplate({
    id: "amulet_power",
    name: "Amulet of Power",
    type: ITEM_TYPES.ACCESSORY,
    rarity: RARITY.EPIC,
    value: 300,
    description:
      "An ancient amulet that enhances the wearer's combat abilities.",
    icon: "🔮",
    level: 15,
    atkBonus: 8,
    magicAtkBonus: 8,
    slot: EQUIPMENT_SLOTS.ACCESSORY_2,
  }),
];

const MATERIAL_TEMPLATES = [
  new ItemTemplate({
    id: "material_iron_ore",
    name: "Iron Ore",
    type: ITEM_TYPES.MATERIAL,
    rarity: RARITY.COMMON,
    value: 3,
    description: "Raw iron ore. Can be smelted into iron ingots.",
    icon: "🪨",
    level: 1,
    craftingMaterial: true,
  }),

  new ItemTemplate({
    id: "material_dragon_scale",
    name: "Dragon Scale",
    type: ITEM_TYPES.MATERIAL,
    rarity: RARITY.LEGENDARY,
    value: 200,
    description: "A scale from an ancient dragon. Highly prized by armorers.",
    icon: "🐲",
    level: 25,
    craftingMaterial: true,
    fireResistant: true,
  }),
];

// ===============================
// REGISTRATION & EXPORTS
// ===============================

// Register all templates
[
  ...WEAPON_TEMPLATES,
  ...ARMOR_TEMPLATES,
  ...POTION_TEMPLATES,
  ...FOOD_TEMPLATES,
  ...ACCESSORY_TEMPLATES,
  ...MATERIAL_TEMPLATES,
].forEach((template) => itemRegistry.register(template));

// Legacy exports for backwards compatibility
export const Items = {
  weapons: WEAPON_TEMPLATES,
  armors: ARMOR_TEMPLATES,
  potions: POTION_TEMPLATES,
  food: FOOD_TEMPLATES,
  accessories: ACCESSORY_TEMPLATES,
  materials: MATERIAL_TEMPLATES,
};

export const AllItems = itemRegistry.getAllTemplates();

// ===============================
// INVENTORY MANAGEMENT
// ===============================

class InventoryManager {
  constructor(maxSlots = 30) {
    this.items = [];
    this.maxSlots = maxSlots;
    this.gold = 0;
  }

  addItem(itemOrId, count = 1, overrides = {}) {
    let item;

    if (typeof itemOrId === "string") {
      item = itemRegistry.createItem(itemOrId, overrides);
    } else if (itemOrId instanceof ItemInstance) {
      item = itemOrId;
    } else {
      throw new Error("Invalid item parameter");
    }

    if (item.canStack()) {
      return this.#addStackableItem(item, count);
    } else {
      return this.#addNonStackableItem(item, count);
    }
  }

  #addStackableItem(item, count) {
    const existingItem = this.items.find(
      (i) => i.id === item.id && i.rarity.id === item.rarity.id && !i.equipped
    );

    if (existingItem) {
      const maxStack = MAX_STACK[item.type];
      const canAdd = Math.min(count, maxStack - existingItem.count);
      existingItem.count += canAdd;
      return canAdd;
    } else if (this.items.length < this.maxSlots) {
      item.count = Math.min(count, MAX_STACK[item.type]);
      this.items.push(item);
      return item.count;
    }

    return 0; // Couldn't add any items
  }

  #addNonStackableItem(item, count) {
    const added = Math.min(count, this.maxSlots - this.items.length);

    for (let i = 0; i < added; i++) {
      this.items.push(i === 0 ? item : item.clone());
    }

    return added;
  }

  removeItem(instanceId, count = 1) {
    const index = this.items.findIndex(
      (item) => item.instanceId === instanceId
    );
    if (index === -1) return false;

    const item = this.items[index];

    if (item.canStack()) {
      item.count -= count;
      if (item.count <= 0) {
        this.items.splice(index, 1);
      }
    } else {
      this.items.splice(index, 1);
    }

    return true;
  }

  getItem(instanceId) {
    return this.items.find((item) => item.instanceId === instanceId);
  }

  getItemsByType(type) {
    return this.items.filter((item) => item.type === type);
  }

  getEquippedItems() {
    return this.items.filter((item) => item.equipped);
  }

  canAddItem(itemOrId, count = 1) {
    let item;

    if (typeof itemOrId === "string") {
      const template = itemRegistry.get(itemOrId);
      if (!template) return false;
      item = {
        type: template.type,
        canStack: () => MAX_STACK[template.type] > 1,
      };
    } else {
      item = itemOrId;
    }

    if (item.canStack()) {
      const existingItem = this.items.find(
        (i) =>
          i.id === item.id && i.rarity?.id === item.rarity?.id && !i.equipped
      );

      if (existingItem) {
        return existingItem.count + count <= MAX_STACK[item.type];
      }
    }

    return this.items.length < this.maxSlots;
  }

  save() {
    return {
      items: this.items.map((item) => item.toJSON()),
      gold: this.gold,
      maxSlots: this.maxSlots,
    };
  }

  load(data) {
    this.items = data.items
      .map((itemData) => {
        const template = itemRegistry.get(itemData.id);
        return template ? template.createInstance(itemData) : null;
      })
      .filter(Boolean);

    this.gold = data.gold || 0;
    this.maxSlots = data.maxSlots || 30;
  }

  clear() {
    this.items = [];
    this.gold = 0;
  }

  // Utility methods
  getTotalValue() {
    return (
      this.items.reduce((total, item) => total + item.value * item.count, 0) +
      this.gold
    );
  }

  getSlotCount() {
    return this.items.length;
  }

  getFreeSlots() {
    return this.maxSlots - this.items.length;
  }
}

// ===============================
// PLAYER INVENTORY INSTANCE
// ===============================

export const playerInventory = new InventoryManager();

// Initialize with starter items
playerInventory.addItem("sword_iron", 1, { equipped: true });
playerInventory.addItem("armor_leather", 1, { equipped: true });
playerInventory.addItem("potion_health_minor", 3);
playerInventory.gold = 100;

// ===============================
// UTILITY FUNCTIONS
// ===============================

export function createItem(id, overrides = {}) {
  return itemRegistry.createItem(id, overrides);
}

export function getItemTemplate(id) {
  return itemRegistry.get(id);
}

export function getItemsByType(type) {
  return itemRegistry.getByType(type);
}

export function getItemsByRarity(rarity) {
  return itemRegistry.getByRarity(rarity);
}

export function generateLoot(playerLevel, quantity = 1) {
  const loot = [];
  const availableItems = itemRegistry.getByLevelRange(
    Math.max(1, playerLevel - 5),
    playerLevel + 3
  );

  for (let i = 0; i < quantity; i++) {
    // Weighted random selection based on drop chance
    const roll = Math.random() * 100;
    let selectedRarity = RARITY.COMMON;

    for (const rarity of Object.values(RARITY)) {
      if (roll <= rarity.dropChance) {
        selectedRarity = rarity;
        break;
      }
    }

    const rarityItems = availableItems.filter(
      (item) => item.rarity.id === selectedRarity.id
    );
    if (rarityItems.length > 0) {
      const randomItem =
        rarityItems[Math.floor(Math.random() * rarityItems.length)];
      loot.push(randomItem.createInstance());
    }
  }

  return loot;
}

export function addItemToInventory(itemOrId, count = 1, overrides = {}) {
  return playerInventory.addItem(itemOrId, count, overrides);
}

export function removeItemFromInventory(instanceId, count = 1) {
  return playerInventory.removeItem(instanceId, count);
}

export function saveInventory() {
  localStorage.setItem(
    "herosDawnInventory",
    JSON.stringify(playerInventory.save())
  );
}

export function loadInventory() {
  const saved = localStorage.getItem("herosDawnInventory");
  if (saved) {
    try {
      playerInventory.load(JSON.parse(saved));
    } catch (error) {
      console.error("Failed to load inventory:", error);
    }
  }
}

// Export classes for advanced usage
export { ItemTemplate, ItemInstance, ItemRegistry, InventoryManager };
