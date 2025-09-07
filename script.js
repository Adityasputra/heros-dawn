// ================= GLOBAL STATE =================
const GameState = {
  character: {
    hp: 82,
    mp: 56,
    exp: 450,
    level: 12,
    maxHp: 100,
    maxMp: 100,
    maxExp: 1000,
    name: "Sir Aditya",
    class: "Knight",
    stats: {
      attack: 45,
      defense: 32,
      magic: 28,
      speed: 38,
    },
  },
  audio: {
    context: null,
    master: null,
    analyser: null,
    isPlaying: false,
    intervalId: null,
    volume: 0.7,
  },
  ui: {
    currentSection: "status",
    mobileMenuOpen: false,
    loadingComplete: false,
  },
  inventory: {
    items: [
      {
        id: 1,
        name: "Iron Sword",
        category: "weapons",
        rarity: "common",
        equipped: true,
        stats: "DMG +15",
      },
      {
        id: 2,
        name: "Wood Shield",
        category: "armor",
        rarity: "common",
        equipped: false,
        stats: "DEF +8",
      },
      {
        id: 3,
        name: "Health Potion",
        category: "consumables",
        rarity: "common",
        equipped: false,
        stats: "Restore 50 HP",
        quantity: 3,
      },
      {
        id: 4,
        name: "Mana Potion",
        category: "consumables",
        rarity: "common",
        equipped: false,
        stats: "Restore 30 MP",
        quantity: 2,
      },
      {
        id: 5,
        name: "Star Shard",
        category: "consumables",
        rarity: "rare",
        equipped: false,
        stats: "Magical Component",
      },
      {
        id: 6,
        name: "World Map",
        category: "tools",
        rarity: "common",
        equipped: false,
        stats: "Navigation Tool",
      },
    ],
  },
  quests: [
    {
      id: 1,
      title: "Ancient Relic Hunt",
      status: "active",
      progress: 60,
      difficulty: "easy",
      description:
        "Find the ancient sword in the western ruins. The weapon holds mysterious powers that could aid in your journey.",
      rewards: "250 XP, 50 Gold, Iron Sword",
      progressText: "3/5 Clues Found",
    },
    {
      id: 2,
      title: "Dragon's Lair Challenge",
      status: "active",
      progress: 33,
      difficulty: "hard",
      description:
        "Collect 3 Dragon Scales from the northern caves. Beware of the ancient guardian that protects them.",
      rewards: "600 XP, Dragon Scale Armor",
      progressText: "1/3 Scales Collected",
    },
    {
      id: 3,
      title: "Fallen Star Investigation",
      status: "completed",
      progress: 100,
      difficulty: "easy",
      description:
        "Helped the village astronomer study the meteorite that fell near the village.",
      rewards: "120 XP, 1 Star Elixir",
      completedDate: "2 days ago",
    },
  ],
};

// ================= LOADING SCREEN =================
class LoadingManager {
  constructor() {
    this.progress = 0;
    this.progressBar = document.getElementById("loadingProgress");
    this.loadingScreen = document.getElementById("loading-screen");
  }

  start() {
    this.simulateLoading();
  }

  simulateLoading() {
    const steps = [
      { text: "Initializing game world...", duration: 800 },
      { text: "Loading character data...", duration: 600 },
      { text: "Preparing quests...", duration: 500 },
      { text: "Setting up inventory...", duration: 400 },
      { text: "Starting adventure...", duration: 300 },
    ];

    let currentStep = 0;
    const loadingText = document.querySelector(".loading-text");

    const loadStep = () => {
      if (currentStep >= steps.length) {
        this.complete();
        return;
      }

      const step = steps[currentStep];
      loadingText.textContent = step.text;

      const targetProgress = ((currentStep + 1) / steps.length) * 100;
      this.animateProgress(targetProgress, step.duration, () => {
        currentStep++;
        setTimeout(loadStep, 100);
      });
    };

    setTimeout(loadStep, 500);
  }

  animateProgress(target, duration, callback) {
    const start = this.progress;
    const change = target - start;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      this.progress = start + change * this.easeOutCubic(progress);
      this.progressBar.style.width = this.progress + "%";

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };

    requestAnimationFrame(animate);
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  complete() {
    setTimeout(() => {
      this.loadingScreen.style.opacity = "0";
      setTimeout(() => {
        this.loadingScreen.style.display = "none";
        GameState.ui.loadingComplete = true;
        this.showMainContent();
      }, 500);
    }, 300);
  }

  showMainContent() {
    document.body.classList.add("game-loaded");
    NotificationManager.show("Welcome to Hero's Dawn!", "success");

    // Initialize other systems
    StarfieldManager.init();
    NavigationManager.init();
    CharacterManager.init();
    QuestManager.init();
    InventoryManager.init();
    AudioManager.init();
    SettingsManager.init();
  }
}

// ================= STARFIELD MANAGER =================
class StarfieldManager {
  static init() {
    this.container = document.getElementById("starfield");
    if (!this.container) return;

    this.generateStars();
    window.addEventListener("resize", () => this.generateStars());
  }

  static generateStars() {
    this.container.innerHTML = "";
    const count = Math.min(200, Math.floor(window.innerWidth / 6));
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = this.createStar();
      fragment.appendChild(star);
    }

    this.container.appendChild(fragment);
  }

  static createStar() {
    const star = document.createElement("div");
    star.className = "star";

    const size = 1 + Math.random() * 2;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    star.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + "s";
    star.style.opacity = (0.2 + Math.random() * 0.8).toFixed(2);

    return star;
  }
}

// ================= NAVIGATION MANAGER =================
class NavigationManager {
  static init() {
    this.menuToggle = document.getElementById("menuToggle");
    this.navMenu = document.getElementById("mainNav");
    this.navLinks = document.querySelectorAll(".nav-link");
    this.panels = document.querySelectorAll(".panel");

    this.setupEventListeners();
    this.showSection("status");
  }

  static setupEventListeners() {
    // Mobile menu toggle
    this.menuToggle?.addEventListener("click", () => this.toggleMobileMenu());

    // Navigation links
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        if (section) {
          this.showSection(section);
          this.closeMobileMenu();
        }
      });
    });

    // Exit button
    document.getElementById("btnExit")?.addEventListener("click", () => {
      DialogManager.showConfirm(
        "Exit Game",
        "Are you sure you want to exit? Your progress will be saved.",
        () => {
          NotificationManager.show("Game saved successfully!", "success");
          setTimeout(() => window.close(), 1000);
        }
      );
    });

    // Close mobile menu on outside click
    document.addEventListener("click", (e) => {
      if (
        GameState.ui.mobileMenuOpen &&
        !this.navMenu.contains(e.target) &&
        !this.menuToggle.contains(e.target)
      ) {
        this.closeMobileMenu();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeMobileMenu();
        DialogManager.closeAll();
      }
    });
  }

  static toggleMobileMenu() {
    GameState.ui.mobileMenuOpen = !GameState.ui.mobileMenuOpen;
    this.menuToggle.setAttribute("aria-expanded", GameState.ui.mobileMenuOpen);
    this.navMenu.classList.toggle("open", GameState.ui.mobileMenuOpen);
  }

  static closeMobileMenu() {
    GameState.ui.mobileMenuOpen = false;
    this.menuToggle.setAttribute("aria-expanded", "false");
    this.navMenu.classList.remove("open");
  }

  static showSection(sectionId) {
    // Update active nav link
    this.navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === sectionId);
    });

    // Show/hide panels
    this.panels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.id !== sectionId);
    });

    // Focus the panel for accessibility
    const activePanel = document.getElementById(sectionId);
    if (activePanel) {
      activePanel.focus();
    }

    GameState.ui.currentSection = sectionId;
  }
}

// ================= CHARACTER MANAGER =================
class CharacterManager {
  static init() {
    this.setupEventListeners();
    this.updateDisplay();
  }

  static setupEventListeners() {
    document.getElementById("btnDamage")?.addEventListener("click", () => {
      this.takeDamage(10);
      SoundManager.playSfx(220);
    });

    document.getElementById("btnHeal")?.addEventListener("click", () => {
      this.heal(15);
      SoundManager.playSfx(440);
    });

    document.getElementById("btnFocus")?.addEventListener("click", () => {
      this.restoreMana(10);
      SoundManager.playSfx(880);
    });

    document.getElementById("btnGainExp")?.addEventListener("click", () => {
      this.gainExperience(50);
      SoundManager.playSfx(660);
    });

    document.getElementById("btnRefresh")?.addEventListener("click", () => {
      this.updateDisplay();
      NotificationManager.show("Character data refreshed!", "success");
    });
  }

  static takeDamage(amount) {
    const oldHp = GameState.character.hp;
    GameState.character.hp = Math.max(0, GameState.character.hp - amount);

    this.updateBar("hp");
    this.animateBarChange("hpBar", "damage");

    if (GameState.character.hp === 0) {
      NotificationManager.show("Character has fallen!", "error");
      this.addStatusEffect("Unconscious", "danger");
    } else if (GameState.character.hp <= 20) {
      NotificationManager.show("Low health warning!", "warning");
      this.addStatusEffect("Critical", "warning");
    }

    NotificationManager.show(`Lost ${amount} HP`, "error");
  }

  static heal(amount) {
    const oldHp = GameState.character.hp;
    GameState.character.hp = Math.min(
      GameState.character.maxHp,
      GameState.character.hp + amount
    );

    this.updateBar("hp");
    this.animateBarChange("hpBar", "heal");

    if (GameState.character.hp > 20) {
      this.removeStatusEffect("Critical");
    }

    if (GameState.character.hp > 0) {
      this.removeStatusEffect("Unconscious");
    }

    NotificationManager.show(`Restored ${amount} HP`, "success");
  }

  static restoreMana(amount) {
    GameState.character.mp = Math.min(
      GameState.character.maxMp,
      GameState.character.mp + amount
    );
    this.updateBar("mp");
    this.animateBarChange("mpBar", "heal");
    NotificationManager.show(`Restored ${amount} MP`, "success");
  }

  static gainExperience(amount) {
    const oldLevel = GameState.character.level;
    GameState.character.exp += amount;

    if (GameState.character.exp >= GameState.character.maxExp) {
      this.levelUp();
    }

    this.updateBar("exp");
    this.animateBarChange("expBar", "exp");
    NotificationManager.show(`Gained ${amount} XP`, "success");
  }

  static levelUp() {
    GameState.character.level++;
    GameState.character.exp -= GameState.character.maxExp;
    GameState.character.maxExp = Math.floor(GameState.character.maxExp * 1.2);

    // Increase stats
    GameState.character.maxHp += 10;
    GameState.character.maxMp += 5;
    GameState.character.hp = GameState.character.maxHp; // Full heal on level up
    GameState.character.mp = GameState.character.maxMp;

    // Update stats
    Object.keys(GameState.character.stats).forEach((stat) => {
      GameState.character.stats[stat] += Math.floor(Math.random() * 3) + 1;
    });

    this.updateDisplay();
    NotificationManager.show(
      `Level Up! Now level ${GameState.character.level}`,
      "success"
    );
    SoundManager.playSfx(880, 0.5);

    setTimeout(() => SoundManager.playSfx(1100, 0.3), 200);
  }

  static updateDisplay() {
    this.updateBar("hp");
    this.updateBar("mp");
    this.updateBar("exp");
    this.updateLevel();
    this.updateStats();
  }

  static updateBar(type) {
    const char = GameState.character;
    let current, max, element, valueElement;

    switch (type) {
      case "hp":
        current = char.hp;
        max = char.maxHp;
        element = document.getElementById("hpBar");
        valueElement = document.getElementById("hpVal");
        break;
      case "mp":
        current = char.mp;
        max = char.maxMp;
        element = document.getElementById("mpBar");
        valueElement = document.getElementById("mpVal");
        break;
      case "exp":
        current = char.exp;
        max = char.maxExp;
        element = document.getElementById("expBar");
        valueElement = document.getElementById("expVal");
        break;
    }

    if (!element || !valueElement) return;

    const percentage = (current / max) * 100;
    element.style.setProperty("--pct", percentage + "%");
    element.setAttribute("aria-valuenow", current);
    element.setAttribute("aria-valuemax", max);

    if (type === "exp") {
      valueElement.textContent = `${current}/${max}`;
      const expToNext = document.querySelector(".exp-to-next");
      if (expToNext) {
        expToNext.textContent = `${max - current} XP to level ${
          char.level + 1
        }`;
      }
    } else {
      valueElement.textContent = `${current}/${max}`;
    }

    // Add low health warning
    if (type === "hp") {
      element.classList.toggle("low", percentage <= 30);
    }
  }

  static updateLevel() {
    const levelElement = document.getElementById("levelNum");
    if (levelElement) {
      levelElement.textContent = GameState.character.level;
    }
  }

  static updateStats() {
    const stats = GameState.character.stats;
    Object.entries(stats).forEach(([stat, value]) => {
      const elements = document.querySelectorAll(
        `[data-stat="${stat}"] .stat-value`
      );
      elements.forEach((el) => (el.textContent = value));
    });
  }

  static animateBarChange(barId, type) {
    const bar = document.getElementById(barId);
    if (!bar) return;

    const animations = {
      damage: [
        { filter: "hue-rotate(0deg) brightness(1.2)" },
        { filter: "hue-rotate(180deg) brightness(0.8)" },
        { filter: "hue-rotate(0deg) brightness(1)" },
      ],
      heal: [
        { filter: "brightness(1)" },
        { filter: "brightness(1.4) saturate(1.2)" },
        { filter: "brightness(1)" },
      ],
      exp: [
        { transform: "scale(1)" },
        { transform: "scale(1.05)" },
        { transform: "scale(1)" },
      ],
    };

    bar.animate(animations[type] || animations.heal, {
      duration: 300,
      easing: "ease-out",
    });
  }

  static addStatusEffect(effect, type = "info") {
    const effectsList = document.getElementById("statusEffects");
    if (!effectsList) return;

    // Remove "None" if present
    const noneEffect = effectsList.querySelector(".effect-item.none");
    if (noneEffect) {
      noneEffect.remove();
    }

    // Check if effect already exists
    if (effectsList.querySelector(`[data-effect="${effect}"]`)) return;

    const effectElement = document.createElement("span");
    effectElement.className = `effect-item ${type}`;
    effectElement.dataset.effect = effect;
    effectElement.textContent = effect;
    effectsList.appendChild(effectElement);
  }

  static removeStatusEffect(effect) {
    const effectsList = document.getElementById("statusEffects");
    if (!effectsList) return;

    const effectElement = effectsList.querySelector(
      `[data-effect="${effect}"]`
    );
    if (effectElement) {
      effectElement.remove();
    }

    // Add "None" if no effects remain
    if (effectsList.children.length === 0) {
      const noneEffect = document.createElement("span");
      noneEffect.className = "effect-item none";
      noneEffect.textContent = "None";
      effectsList.appendChild(noneEffect);
    }
  }
}

// ================= QUEST MANAGER =================
class QuestManager {
  static init() {
    this.setupEventListeners();
    this.renderQuests();
  }

  static setupEventListeners() {
    // Quest filters
    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setFilter(btn.dataset.filter);
        this.updateFilterButtons(btn);
      });
    });

    // Quest expansion
    document.addEventListener("click", (e) => {
      if (e.target.closest(".quest-expand")) {
        const questItem = e.target.closest(".quest-item");
        this.toggleQuestExpansion(questItem);
      }

      // Quest actions
      if (e.target.matches(".quest-actions .btn")) {
        const action = e.target.textContent.toLowerCase().trim();
        const questItem = e.target.closest(".quest-item");
        const questId = parseInt(questItem.dataset.questId);
        this.handleQuestAction(questId, action);
      }
    });
  }

  static renderQuests() {
    const questList = document.querySelector(".quest-list");
    if (!questList) return;

    questList.innerHTML = "";

    GameState.quests.forEach((quest) => {
      const questElement = this.createQuestElement(quest);
      questList.appendChild(questElement);
    });

    this.updateQuestStats();
  }

  static createQuestElement(quest) {
    const li = document.createElement("li");
    li.className = `quest-item ${quest.status}`;
    li.dataset.status = quest.status;
    li.dataset.questId = quest.id;
    li.tabIndex = 0;

    li.innerHTML = `
      <div class="quest-header">
        <span class="quest-icon" aria-hidden="true">${this.getQuestIcon(
          quest
        )}</span>
        <div class="quest-meta">
          <h3 class="quest-title">${quest.title}</h3>
          <div class="quest-tags">
            <span class="quest-tag ${quest.status}">${
      quest.status.charAt(0).toUpperCase() + quest.status.slice(1)
    }</span>
            <span class="quest-difficulty ${quest.difficulty}">${
      quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)
    }</span>
          </div>
        </div>
        <button class="quest-expand" aria-label="Expand quest details">
          <span aria-hidden="true">▼</span>
        </button>
      </div>
      <div class="quest-body">
        <p class="quest-description">${quest.description}</p>
        ${quest.status === "active" ? this.createQuestProgress(quest) : ""}
        ${quest.status === "completed" ? this.createQuestCompletion(quest) : ""}
        <div class="quest-rewards ${
          quest.status === "completed" ? "received" : ""
        }">
          <strong>${
            quest.status === "completed" ? "Rewards Received:" : "Rewards:"
          }</strong> ${quest.rewards}
        </div>
        ${quest.status === "active" ? this.createQuestActions() : ""}
      </div>
    `;

    return li;
  }

  static createQuestProgress(quest) {
    return `
      <div class="quest-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${quest.progress}%"></div>
        </div>
        <span class="progress-text">${quest.progressText}</span>
      </div>
    `;
  }

  static createQuestCompletion(quest) {
    return `
      <div class="quest-completion">
        <span class="completion-date">Completed ${quest.completedDate}</span>
      </div>
    `;
  }

  static createQuestActions() {
    return `
      <div class="quest-actions">
        <button class="btn small primary">Track</button>
        <button class="btn small secondary">Abandon</button>
      </div>
    `;
  }

  static getQuestIcon(quest) {
    const icons = {
      "Ancient Relic Hunt": "🧭",
      "Dragon's Lair Challenge": "🐉",
      "Fallen Star Investigation": "🌟",
    };
    return icons[quest.title] || "📜";
  }

  static toggleQuestExpansion(questItem) {
    questItem.classList.toggle("expanded");
    const expandBtn = questItem.querySelector(".quest-expand span");
    expandBtn.style.transform = questItem.classList.contains("expanded")
      ? "rotate(180deg)"
      : "rotate(0deg)";
  }

  static handleQuestAction(questId, action) {
    const quest = GameState.quests.find((q) => q.id === questId);
    if (!quest) return;

    switch (action) {
      case "track":
        NotificationManager.show(`Now tracking: ${quest.title}`, "info");
        break;
      case "abandon":
        DialogManager.showConfirm(
          "Abandon Quest",
          `Are you sure you want to abandon "${quest.title}"?`,
          () => {
            GameState.quests = GameState.quests.filter((q) => q.id !== questId);
            this.renderQuests();
            NotificationManager.show("Quest abandoned", "warning");
          }
        );
        break;
    }
  }

  static updateQuestStats() {
    const activeQuests = GameState.quests.filter(
      (q) => q.status === "active"
    ).length;
    const completedQuests = GameState.quests.filter(
      (q) => q.status === "completed"
    ).length;
    const totalExp = GameState.quests
      .filter((q) => q.status === "completed")
      .reduce(
        (sum, q) => sum + parseInt(q.rewards.match(/(\d+) XP/)?.[1] || 0),
        0
      );

    document.querySelectorAll(".quest-stat").forEach((stat, index) => {
      const number = stat.querySelector(".stat-number");
      switch (index) {
        case 0:
          number.textContent = activeQuests;
          break;
        case 1:
          number.textContent = completedQuests;
          break;
        case 2:
          number.textContent = totalExp;
          break;
      }
    });
  }

  static setFilter(filter) {
    const questItems = document.querySelectorAll(".quest-item");
    questItems.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.status === filter;
      item.style.display = shouldShow ? "block" : "none";
    });
  }

  static updateFilterButtons(activeBtn) {
    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.classList.toggle("active", btn === activeBtn);
    });
  }
}

// ================= INVENTORY MANAGER =================
class InventoryManager {
  static init() {
    this.setupEventListeners();
    this.renderInventory();
  }

  static setupEventListeners() {
    // Inventory filters
    document.querySelectorAll("[data-category]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setFilter(btn.dataset.category);
        this.updateFilterButtons(btn);
      });
    });

    // Item interactions
    document.addEventListener("click", (e) => {
      const itemSlot = e.target.closest(".item-slot");
      if (itemSlot && !itemSlot.classList.contains("empty")) {
        this.handleItemClick(itemSlot);
      }
    });

    // Tooltip management
    document.addEventListener("mouseover", (e) => {
      const itemSlot = e.target.closest(".item-slot:not(.empty)");
      if (itemSlot) {
        this.showTooltip(itemSlot, e);
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(".item-slot")) {
        this.hideTooltip();
      }
    });

    // Sort button
    document
      .getElementById("btnSortInventory")
      ?.addEventListener("click", () => {
        this.sortInventory();
        NotificationManager.show("Inventory sorted!", "success");
      });
  }

  static renderInventory() {
    const grid = document.querySelector(".inventory-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // Render items
    GameState.inventory.items.forEach((item) => {
      const itemElement = this.createItemElement(item);
      grid.appendChild(itemElement);
    });

    // Add empty slots
    const totalSlots = 20;
    const emptySlots = totalSlots - GameState.inventory.items.length;
    for (let i = 0; i < emptySlots; i++) {
      const emptySlot = this.createEmptySlot();
      grid.appendChild(emptySlot);
    }

    this.updateInventoryInfo();
  }

  static createItemElement(item) {
    const div = document.createElement("div");
    div.className = `item-slot ${item.rarity} ${
      item.equipped ? "equipped" : ""
    }`;
    div.dataset.name = item.name;
    div.dataset.category = item.category;
    div.dataset.rarity = item.rarity;
    div.dataset.itemId = item.id;
    div.tabIndex = 0;
    div.setAttribute("role", "gridcell");

    div.innerHTML = `
      <div class="item-content">
        <div class="pixel-icon ${this.getItemIcon(
          item
        )}" aria-hidden="true"></div>
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-stats">${item.stats}</span>
        </div>
        ${
          item.quantity
            ? `<div class="item-quantity">x${item.quantity}</div>`
            : ""
        }
        <div class="item-rarity ${item.rarity}"></div>
        ${
          item.equipped
            ? '<div class="equipped-indicator" aria-label="Equipped">⚡</div>'
            : ""
        }
      </div>
    `;

    return div;
  }

  static createEmptySlot() {
    const div = document.createElement("div");
    div.className = "item-slot empty";
    div.setAttribute("aria-label", "Empty slot");
    div.tabIndex = 0;
    div.setAttribute("role", "gridcell");
    div.innerHTML = '<div class="empty-indicator">+</div>';
    return div;
  }

  static getItemIcon(item) {
    const iconMap = {
      "Iron Sword": "sword",
      "Wood Shield": "shield",
      "Health Potion": "potion red",
      "Mana Potion": "potion blue",
      "Star Shard": "star",
      "World Map": "map",
    };
    return iconMap[item.name] || "star";
  }

  static handleItemClick(itemSlot) {
    const itemId = parseInt(itemSlot.dataset.itemId);
    const item = GameState.inventory.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.category === "consumables") {
      this.useItem(item);
    } else if (item.category === "weapons" || item.category === "armor") {
      this.toggleEquip(item);
    } else {
      NotificationManager.show(`You examine the ${item.name}`, "info");
    }
  }

  static useItem(item) {
    if (item.name === "Health Potion") {
      CharacterManager.heal(50);
      this.consumeItem(item);
    } else if (item.name === "Mana Potion") {
      CharacterManager.restoreMana(30);
      this.consumeItem(item);
    } else {
      NotificationManager.show(`Used ${item.name}`, "success");
    }
  }

  static consumeItem(item) {
    if (item.quantity && item.quantity > 1) {
      item.quantity--;
    } else {
      GameState.inventory.items = GameState.inventory.items.filter(
        (i) => i.id !== item.id
      );
    }
    this.renderInventory();
  }

  static toggleEquip(item) {
    // Unequip other items of same category
    GameState.inventory.items.forEach((i) => {
      if (i.category === item.category && i.id !== item.id) {
        i.equipped = false;
      }
    });

    item.equipped = !item.equipped;
    this.renderInventory();

    const action = item.equipped ? "equipped" : "unequipped";
    NotificationManager.show(`${item.name} ${action}!`, "success");
  }

  static showTooltip(itemSlot, event) {
    const tooltip = document.getElementById("itemTooltip");
    const itemId = parseInt(itemSlot.dataset.itemId);
    const item = GameState.inventory.items.find((i) => i.id === itemId);

    if (!tooltip || !item) return;

    const content = tooltip.querySelector(".tooltip-content");
    content.innerHTML = `
      <h4 class="tooltip-title">${item.name}</h4>
      <p class="tooltip-description">${this.getItemDescription(item)}</p>
      <div class="tooltip-stats">${item.stats}</div>
      <div class="tooltip-actions">
        ${this.getTooltipActions(item)}
      </div>
    `;

    // Position tooltip
    const rect = itemSlot.getBoundingClientRect();
    tooltip.style.left = rect.right + 10 + "px";
    tooltip.style.top = rect.top + "px";

    tooltip.setAttribute("aria-hidden", "false");
  }

  static hideTooltip() {
    const tooltip = document.getElementById("itemTooltip");
    if (tooltip) {
      tooltip.setAttribute("aria-hidden", "true");
    }
  }

  static getItemDescription(item) {
    const descriptions = {
      "Iron Sword": "A sturdy blade forged from iron. Reliable in combat.",
      "Wood Shield": "A simple wooden shield that provides basic protection.",
      "Health Potion": "A red potion that restores health when consumed.",
      "Mana Potion": "A blue elixir that restores magical energy.",
      "Star Shard":
        "A fragment of a fallen star, pulsing with mysterious energy.",
      "World Map": "A detailed map showing the known regions of the world.",
    };
    return (
      descriptions[item.name] || "A mysterious item with unknown properties."
    );
  }

  static getTooltipActions(item) {
    if (item.category === "consumables") {
      return '<button class="btn small primary">Use</button>';
    } else if (item.category === "weapons" || item.category === "armor") {
      const action = item.equipped ? "Unequip" : "Equip";
      return `<button class="btn small secondary">${action}</button>`;
    }
    return '<button class="btn small">Examine</button>';
  }

  static setFilter(category) {
    const items = document.querySelectorAll(".item-slot:not(.empty)");
    items.forEach((item) => {
      const shouldShow =
        category === "all" || item.dataset.category === category;
      item.style.display = shouldShow ? "flex" : "none";
    });
  }

  static updateFilterButtons(activeBtn) {
    document.querySelectorAll("[data-category]").forEach((btn) => {
      btn.classList.toggle("active", btn === activeBtn);
    });
  }

  static updateInventoryInfo() {
    const itemCount = document.querySelector(".item-count");
    if (itemCount) {
      const totalItems = GameState.inventory.items.length;
      itemCount.textContent = `${totalItems}/20 Items`;
    }
  }

  static sortInventory() {
    GameState.inventory.items.sort((a, b) => {
      // Sort by category, then by rarity, then by name
      const categoryOrder = ["weapons", "armor", "consumables", "tools"];
      const rarityOrder = ["legendary", "epic", "rare", "common"];

      const catDiff =
        categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (catDiff !== 0) return catDiff;

      const rarityDiff =
        rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      if (rarityDiff !== 0) return rarityDiff;

      return a.name.localeCompare(b.name);
    });

    this.renderInventory();
  }
}

// ================= AUDIO MANAGER =================
class AudioManager {
  static init() {
    this.setupEventListeners();
  }

  static setupEventListeners() {
    const musicBtn = document.getElementById("btnToggleMusic");
    musicBtn?.addEventListener("click", () => this.toggleMusic());
  }

  static toggleMusic() {
    if (GameState.audio.isPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  static async startMusic() {
    if (GameState.audio.isPlaying) return;

    try {
      GameState.audio.context = new (window.AudioContext ||
        window.webkitAudioContext)();
      GameState.audio.master = GameState.audio.context.createGain();
      GameState.audio.analyser = GameState.audio.context.createAnalyser();

      GameState.audio.master.gain.value = GameState.audio.volume;
      GameState.audio.master
        .connect(GameState.audio.analyser)
        .connect(GameState.audio.context.destination);

      GameState.audio.isPlaying = true;
      this.updateMusicButton();
      this.playMelody();

      NotificationManager.show("Music started", "success");
    } catch (error) {
      console.error("Failed to start audio:", error);
      NotificationManager.show("Failed to start music", "error");
    }
  }

  static stopMusic() {
    if (!GameState.audio.isPlaying) return;

    GameState.audio.isPlaying = false;

    if (GameState.audio.intervalId) {
      clearInterval(GameState.audio.intervalId);
      GameState.audio.intervalId = null;
    }

    if (GameState.audio.master) {
      GameState.audio.master.gain.exponentialRampToValueAtTime(
        0.0001,
        GameState.audio.context.currentTime + 0.5
      );
    }

    setTimeout(() => {
      if (GameState.audio.context) {
        GameState.audio.context.close();
        GameState.audio.context = null;
        GameState.audio.master = null;
        GameState.audio.analyser = null;
      }
    }, 600);

    this.updateMusicButton();
    NotificationManager.show("Music stopped", "info");
  }

  static playMelody() {
    const bpm = 120;
    const beat = 60 / bpm;

    const schedule = () => {
      if (!GameState.audio.isPlaying) return;

      const now = GameState.audio.context.currentTime;
      const melody = [
        220, 261.63, 329.63, 392.0, 220, 261.63, 329.63, 392.0, 196, 246.94,
        329.63, 392.0, 174.61, 261.63, 329.63, 392.0,
      ];

      melody.forEach((freq, i) => {
        const time = now + i * (beat / 2);
        this.createNote(freq, time, beat / 4, "square", 0.05);

        // Add bass notes
        if (i % 2 === 0) {
          this.createNote(freq / 2, time, beat / 2, "sawtooth", 0.03);
        }
      });
    };

    schedule();
    GameState.audio.intervalId = setInterval(schedule, 8000);
  }

  static createNote(
    frequency,
    time,
    duration,
    waveType = "square",
    volume = 0.06
  ) {
    if (!GameState.audio.context || !GameState.audio.master) return;

    const oscillator = GameState.audio.context.createOscillator();
    const gainNode = GameState.audio.context.createGain();

    oscillator.type = waveType;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode).connect(GameState.audio.master);
    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  static updateMusicButton() {
    const btn = document.getElementById("btnToggleMusic");
    if (!btn) return;

    const icon = btn.querySelector(".music-icon");
    const text = btn.querySelector(".music-text");

    if (GameState.audio.isPlaying) {
      btn.setAttribute("aria-pressed", "true");
      icon.textContent = "⏸️";
      text.textContent = "Pause Music";
    } else {
      btn.setAttribute("aria-pressed", "false");
      icon.textContent = "🎵";
      text.textContent = "Play Music";
    }
  }
}

// ================= SOUND MANAGER =================
class SoundManager {
  static playSfx(frequency, volume = 0.05, duration = 0.25) {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(volume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration
      );

      oscillator.connect(gainNode).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  }
}

// ================= NOTIFICATION MANAGER =================
class NotificationManager {
  static show(message, type = "info", duration = 3000) {
    const container = document.getElementById("notificationContainer");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.setAttribute("role", "alert");

    container.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
}

// ================= DIALOG MANAGER =================
class DialogManager {
  static showConfirm(title, message, onConfirm, onCancel = null) {
    const dialog = document.getElementById("confirmDialog");
    const titleEl = document.getElementById("dialogTitle");
    const messageEl = document.getElementById("dialogMessage");
    const confirmBtn = document.getElementById("dialogConfirm");
    const cancelBtn = document.getElementById("dialogCancel");
    const closeBtn = document.getElementById("dialogClose");

    if (!dialog) return;

    titleEl.textContent = title;
    messageEl.textContent = message;

    // Setup event listeners
    const handleConfirm = () => {
      this.close("confirmDialog");
      if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
      this.close("confirmDialog");
      if (onCancel) onCancel();
    };

    // Remove existing listeners
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    closeBtn.replaceWith(closeBtn.cloneNode(true));

    // Add new listeners
    document
      .getElementById("dialogConfirm")
      .addEventListener("click", handleConfirm);
    document
      .getElementById("dialogCancel")
      .addEventListener("click", handleCancel);
    document
      .getElementById("dialogClose")
      .addEventListener("click", handleCancel);

    this.show("confirmDialog");
  }

  static show(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
      dialog.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  }

  static close(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
      dialog.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  static closeAll() {
    document
      .querySelectorAll(".dialog-overlay, .settings-overlay")
      .forEach((dialog) => {
        dialog.setAttribute("aria-hidden", "true");
      });
    document.body.style.overflow = "";
  }
}

// ================= SETTINGS MANAGER =================
class SettingsManager {
  static init() {
    this.setupEventListeners();
    this.loadSettings();
  }

  static setupEventListeners() {
    const settingsBtn = document.getElementById("btnSettings");
    const settingsClose = document.getElementById("settingsClose");
    const saveBtn = document.getElementById("saveSettings");
    const resetBtn = document.getElementById("resetSettings");

    settingsBtn?.addEventListener("click", () =>
      DialogManager.show("settingsPanel")
    );
    settingsClose?.addEventListener("click", () =>
      DialogManager.close("settingsPanel")
    );
    saveBtn?.addEventListener("click", () => this.saveSettings());
    resetBtn?.addEventListener("click", () => this.resetSettings());

    // Volume slider
    const volumeSlider = document.getElementById("volumeSlider");
    const volumeValue = document.getElementById("volumeValue");

    volumeSlider?.addEventListener("input", (e) => {
      const value = e.target.value;
      volumeValue.textContent = value + "%";
      GameState.audio.volume = value / 100;
      if (GameState.audio.master) {
        GameState.audio.master.gain.value = GameState.audio.volume;
      }
    });
  }

  static saveSettings() {
    const settings = {
      volume: document.getElementById("volumeSlider")?.value || 70,
      animations: document.getElementById("animationsToggle")?.checked || true,
      autosave: document.getElementById("autosaveToggle")?.checked || true,
      theme: document.getElementById("themeSelect")?.value || "dark",
    };

    localStorage.setItem("herosdawn_settings", JSON.stringify(settings));
    NotificationManager.show("Settings saved!", "success");
    DialogManager.close("settingsPanel");
  }

  static loadSettings() {
    try {
      const saved = localStorage.getItem("herosdown_settings");
      if (saved) {
        const settings = JSON.parse(saved);

        const volumeSlider = document.getElementById("volumeSlider");
        const animationsToggle = document.getElementById("animationsToggle");
        const autosaveToggle = document.getElementById("autosaveToggle");
        const themeSelect = document.getElementById("themeSelect");

        if (volumeSlider) volumeSlider.value = settings.volume || 70;
        if (animationsToggle)
          animationsToggle.checked = settings.animations !== false;
        if (autosaveToggle)
          autosaveToggle.checked = settings.autosave !== false;
        if (themeSelect) themeSelect.value = settings.theme || "dark";

        GameState.audio.volume = (settings.volume || 70) / 100;
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  static resetSettings() {
    DialogManager.showConfirm(
      "Reset Settings",
      "Are you sure you want to reset all settings to default?",
      () => {
        localStorage.removeItem("herosdown_settings");
        this.loadSettings();
        NotificationManager.show("Settings reset to default", "info");
      }
    );
  }
}

// ================= FOOTER TIPS =================
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
    this.startRotation();
  }

  static startRotation() {
    if (!this.tipElement) return;

    setInterval(() => {
      this.showNextTip();
    }, 10000); // Change tip every 10 seconds
  }

  static showNextTip() {
    if (!this.tipElement) return;

    this.tipElement.style.opacity = "0";

    setTimeout(() => {
      this.currentTip = (this.currentTip + 1) % this.tips.length;
      this.tipElement.textContent = this.tips[this.currentTip];
      this.tipElement.style.opacity = "1";
    }, 300);
  }
}

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  const loader = new LoadingManager();
  loader.start();

  // Initialize footer tips
  FooterTips.init();

  // Save game state periodically
  setInterval(() => {
    try {
      localStorage.setItem("herosdown_gamestate", JSON.stringify(GameState));
      const saveStatus = document.getElementById("saveStatus");
      if (saveStatus) {
        saveStatus.textContent = "Auto-saved";
        setTimeout(() => {
          saveStatus.textContent = "Game saved";
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }, 30000); // Auto-save every 30 seconds

  // Load saved game state
  try {
    const saved = localStorage.getItem("herosdown_gamestate");
    if (saved) {
      const savedState = JSON.parse(saved);
      Object.assign(GameState, savedState);
    }
  } catch (error) {
    console.error("Failed to load saved game state:", error);
  }
});

// ================= ERROR HANDLING =================
window.addEventListener("error", (event) => {
  console.error("Game error:", event.error);
  NotificationManager.show(
    "An error occurred. Check console for details.",
    "error"
  );
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  NotificationManager.show(
    "An error occurred. Check console for details.",
    "error"
  );
});
