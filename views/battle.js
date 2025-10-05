import { Items, playerInventory } from "../data/item.js";
import { stats, updateBars, showNotification } from "../scripts/demo.js";

// Enhanced monster data with proper attributes and scaling
const Monsters = [
  {
    id: "zombie",
    name: "Zombie",
    baseHp: 30,
    baseAtk: 8,
    baseDef: 4,
    sprite: "assets/chars/zombie.svg",
    description: "A slow but resilient undead creature",
    weakTo: "fire",
  },
  {
    id: "skeleton",
    name: "Skeleton",
    baseHp: 40,
    baseAtk: 10,
    baseDef: 3,
    sprite: "assets/chars/skeleton.svg",
    description: "A fast and agile undead adversary",
    weakTo: "holy",
  },
  {
    id: "slime",
    name: "Slime",
    baseHp: 20,
    baseAtk: 5,
    baseDef: 2,
    sprite: "assets/chars/slime.svg",
    description:
      "A gelatinous creature with high resistance to physical attacks",
    weakTo: "ice",
  },
];

// Enhanced skill system with proper effects and MP costs
const specialSkills = {
  common: {
    name: "Quick Slash",
    mpCost: 5,
    damageMultiplier: 1.5,
    effect: "normal",
  },
  rare: {
    name: "Power Strike",
    mpCost: 8,
    damageMultiplier: 1.8,
    effect: "stun",
  },
  epic: {
    name: "Blazing Edge",
    mpCost: 12,
    damageMultiplier: 2.0,
    effect: "burn",
  },
  legendary: {
    name: "Thunder Strike",
    mpCost: 15,
    damageMultiplier: 2.5,
    effect: "paralyze",
  },
  mythic: {
    name: "Phoenix Slash",
    mpCost: 20,
    damageMultiplier: 3.0,
    effect: "all",
  },
};

/**
 * Render the battle view with proper UI elements
 * @param {number} stage - The current battle stage
 * @returns {string} HTML for the battle view
 */
export default function BattleView(stage = 1) {
  // Scale monsters based on stage level
  const monsterCount = Math.min(Math.floor(stage / 3) + 1, 3);
  const monsters = generateMonsters(monsterCount, stage);

  // Get player's equipped weapon
  const equippedWeapons = playerInventory.filter(
    (item) => item.type === "pedang"
  );
  const weapon =
    equippedWeapons.length > 0
      ? equippedWeapons.reduce(
          (best, current) =>
            getWeaponValue(current) > getWeaponValue(best) ? current : best,
          equippedWeapons[0]
        )
      : { name: "Fists", variant: "common", atk: 5 };

  const skillName =
    weapon.variant && specialSkills[weapon.variant]
      ? specialSkills[weapon.variant].name
      : "Basic Attack";

  const monsterHTML = monsters
    .map(
      (monster, index) => `
    <div class="monster" id="monster-${index}" data-monster-id="${monster.id}">
      <div class="monster-portrait">
        <img src="${monster.sprite}" alt="${monster.name}" />
      </div>
      <div class="monster-info">
        <div class="monster-name">${monster.name}</div>
        <div class="monster-health-bar">
          <div class="health-bar-label">HP: <span id="monster-hp-value-${index}">${
        monster.currentHp
      }/${monster.maxHp}</span></div>
          <div class="health-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${
            (monster.currentHp / monster.maxHp) * 100
          }">
            <div class="health-bar-fill" id="monster-hp-bar-${index}" style="width: ${
        (monster.currentHp / monster.maxHp) * 100
      }%"></div>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  return `
    <section class="battle-view">
      <header class="battle-header">
        <h2>⚔️ Battle - Stage ${stage}</h2>
        <div class="battle-info">
          <span class="battle-stage-indicator">Enemies: ${monsterCount}</span>
          <span class="battle-weapon-indicator">Weapon: ${
            weapon.name || "Fists"
          }</span>
        </div>
      </header>

      <div class="battle-arena">
        <div class="player-section">
          <div class="player-portrait">
            <img src="assets/chars/hero.png" alt="Player" />
          </div>
          <div class="player-stats">
            <div class="stat-bar hp-bar">
              <label>HP:</label>
              <div class="bar">
                <div class="fill hp" id="battle-hp-bar" style="width: ${
                  (stats.hp.current / stats.hp.max) * 100
                }%"></div>
              </div>
              <span id="playerHp">${stats.hp.current}/${stats.hp.max}</span>
            </div>
            <div class="stat-bar mp-bar">
              <label>MP:</label>
              <div class="bar">
                <div class="fill mp" id="battle-mp-bar" style="width: ${
                  (stats.mp.current / stats.mp.max) * 100
                }%"></div>
              </div>
              <span id="playerMp">${stats.mp.current}/${stats.mp.max}</span>
            </div>
          </div>
        </div>

        <div class="battle-divider">VS</div>

        <div class="monsters-section">
          ${monsterHTML}
        </div>
      </div>

      <div class="battle-log-container">
        <div id="battle-log" class="battle-log">
          <div class="log-entry">Battle started! You encounter ${monsterCount} enemy ${
    monsterCount > 1 ? "monsters" : "monster"
  }.</div>
        </div>
      </div>

      <div class="battle-controls">
        <button class="btn btn-action" id="attackBtn">
          <span class="btn-icon">⚔️</span>
          <span>Attack</span>
        </button>
        <button class="btn btn-action" id="defendBtn">
          <span class="btn-icon">🛡️</span>
          <span>Defend</span>
        </button>
        <button class="btn btn-action btn-special" id="specialBtn" data-mp-cost="${
          weapon.variant ? specialSkills[weapon.variant]?.mpCost || 5 : 5
        }">
          <span class="btn-icon">✨</span>
          <span>${skillName} (${
    weapon.variant ? specialSkills[weapon.variant]?.mpCost || 5 : 5
  } MP)</span>
        </button>
        <button class="btn btn-action btn-escape" id="escapeBtn">
          <span class="btn-icon">🏃</span>
          <span>Escape</span>
        </button>
      </div>
    </section>
  `;
}

/**
 * Generate scaled monsters based on stage level
 * @param {number} count - Number of monsters to generate
 * @param {number} stage - Current battle stage
 * @returns {Array} Array of monster objects
 */
function generateMonsters(count, stage) {
  const monsters = [];
  // Scaling factor increases with stage
  const scalingFactor = 1 + stage * 0.1;

  for (let i = 0; i < count; i++) {
    const baseMonster = Monsters[Math.floor(Math.random() * Monsters.length)];
    const monster = {
      ...baseMonster,
      maxHp: Math.floor(baseMonster.baseHp * scalingFactor),
      atk: Math.floor(baseMonster.baseAtk * scalingFactor),
      def: Math.floor(baseMonster.baseDef * scalingFactor),
    };

    monster.currentHp = monster.maxHp;
    monsters.push(monster);
  }

  return monsters;
}

/**
 * Calculate a weapon's value for comparison
 * @param {Object} weapon - Weapon object
 * @returns {number} Calculated weapon value
 */
function getWeaponValue(weapon) {
  const variantMultiplier = {
    common: 1,
    rare: 1.5,
    epic: 2,
    legendary: 3,
    mythic: 4,
  };

  return weapon.atk * (variantMultiplier[weapon.variant] || 1);
}

/**
 * Initialize battle mechanics and event handlers
 * @param {number} stage - Current battle stage
 */
export function initBattle(stage = 1) {
  const logEl = document.getElementById("battle-log");
  const playerHpEl = document.getElementById("playerHp");
  const playerMpEl = document.getElementById("playerMp");
  const battleHpBar = document.getElementById("battle-hp-bar");
  const battleMpBar = document.getElementById("battle-mp-bar");

  // Get all monster elements and create data objects
  const monsters = Array.from(document.querySelectorAll(".monster")).map(
    (monsterEl) => {
      const index = monsterEl.id.split("-")[1];
      const id = monsterEl.dataset.monsterId;
      const baseMonster = Monsters.find((m) => m.id === id);

      // Get HP values
      const hpTextEl = document.getElementById(`monster-hp-value-${index}`);
      const hpText = hpTextEl.textContent;
      const [current, max] = hpText.split("/").map(Number);

      return {
        el: monsterEl,
        id: id,
        index: index,
        name: baseMonster.name,
        currentHp: current,
        maxHp: max,
        atk: Math.floor(baseMonster.baseAtk * (1 + stage * 0.1)),
        def: Math.floor(baseMonster.baseDef * (1 + stage * 0.1)),
        hpTextEl: hpTextEl,
        hpBarEl: document.getElementById(`monster-hp-bar-${index}`),
      };
    }
  );

  let isPlayerDefending = false;
  let isBattleOver = false;

  // Get player's weapon
  const equippedWeapons = playerInventory.filter(
    (item) => item.type === "pedang"
  );
  const weapon =
    equippedWeapons.length > 0
      ? equippedWeapons.reduce(
          (best, current) =>
            getWeaponValue(current) > getWeaponValue(best) ? current : best,
          equippedWeapons[0]
        )
      : { name: "Fists", variant: "common", atk: 5 };

  /**
   * Add message to battle log
   * @param {string} msg - Message to add
   * @param {string} type - Message type (normal, success, warning, error)
   */
  function log(msg, type = "normal") {
    const entry = document.createElement("div");
    entry.className = `log-entry log-${type}`;
    entry.textContent = msg;

    // Limit log to last 50 entries
    if (logEl.children.length > 50) {
      logEl.removeChild(logEl.firstChild);
    }

    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
  }

  /**
   * Update HP/MP display
   */
  function updatePlayerStats() {
    // Update text
    playerHpEl.textContent = `${stats.hp.current}/${stats.hp.max}`;
    playerMpEl.textContent = `${stats.mp.current}/${stats.mp.max}`;

    // Update bars
    battleHpBar.style.width = `${(stats.hp.current / stats.hp.max) * 100}%`;
    battleMpBar.style.width = `${(stats.mp.current / stats.mp.max) * 100}%`;

    // Update main UI bars
    updateBars();
  }

  /**
   * Update monster HP display
   * @param {Object} monster - Monster object
   */
  function updateMonsterHP(monster) {
    const percentHP = (monster.currentHp / monster.maxHp) * 100;
    monster.hpTextEl.textContent = `${monster.currentHp}/${monster.maxHp}`;
    monster.hpBarEl.style.width = `${percentHP}%`;

    // Add visual feedback based on HP percentage
    if (percentHP <= 25) {
      monster.hpBarEl.classList.add("critical");
    } else if (percentHP <= 50) {
      monster.hpBarEl.classList.add("low");
      monster.hpBarEl.classList.remove("critical");
    } else {
      monster.hpBarEl.classList.remove("low", "critical");
    }

    // Add visual indicator if monster is defeated
    if (monster.currentHp <= 0) {
      monster.el.classList.add("defeated");
    }
  }

  /**
   * Check if battle is over
   * @returns {boolean} True if battle is over
   */
  function checkBattleEnd() {
    if (isBattleOver) return true;

    const aliveMonsters = monsters.filter((m) => m.currentHp > 0);

    // Player wins
    if (aliveMonsters.length === 0) {
      isBattleOver = true;
      log("🎉 Victory! All enemies defeated!", "success");

      // Calculate rewards based on stage
      const expGained = 50 * stage;
      const goldGained = 20 * stage;

      // Update player stats
      stats.exp.current += expGained;
      if (stats.exp.current >= stats.exp.max) {
        // Level up logic would go here
        log("⭐ Level Up!", "success");
      }

      // Show rewards
      setTimeout(() => {
        showNotification(
          `Battle Complete! Gained ${expGained} EXP and ${goldGained} Gold`,
          "success"
        );
        giveBattleReward(stage);
      }, 1000);

      return true;
    }

    // Player loses
    if (stats.hp.current <= 0) {
      isBattleOver = true;
      stats.hp.current = 0;
      updatePlayerStats();
      log("💀 Defeat! You have been defeated.", "error");

      // Show game over message
      setTimeout(() => {
        showNotification(
          "Game Over! You have been defeated in battle.",
          "error"
        );
      }, 1000);

      return true;
    }

    return false;
  }

  /**
   * Handle monster's turn
   */
  function monsterTurn() {
    if (checkBattleEnd()) return;

    const defenseMultiplier = isPlayerDefending ? 0.5 : 1;
    isPlayerDefending = false; // Reset defense status

    // Each alive monster attacks
    monsters
      .filter((m) => m.currentHp > 0)
      .forEach((monster) => {
        // Calculate damage with some randomness
        const baseDamage = monster.atk + Math.floor(Math.random() * 3);
        const damageTaken = Math.max(
          1,
          Math.floor(baseDamage * defenseMultiplier)
        );

        // Apply damage to player
        stats.hp.current = Math.max(0, stats.hp.current - damageTaken);
        updatePlayerStats();

        // Log attack
        if (defenseMultiplier < 1) {
          log(
            `${monster.name} attacks! You block and take ${damageTaken} damage.`,
            "warning"
          );
        } else {
          log(`${monster.name} attacks for ${damageTaken} damage!`, "warning");
        }
      });

    checkBattleEnd();
  }

  // Event handler for basic attack
  document.getElementById("attackBtn").addEventListener("click", () => {
    if (isBattleOver) return;

    // Find first alive monster
    const target = monsters.find((m) => m.currentHp > 0);
    if (!target) return;

    // Calculate damage
    const baseDamage = (weapon.atk || 5) + Math.floor(Math.random() * 5);
    const damage = Math.max(1, baseDamage - Math.floor(target.def / 2));

    // Apply damage
    target.currentHp = Math.max(0, target.currentHp - damage);
    updateMonsterHP(target);

    // Log attack
    log(`You attack ${target.name} for ${damage} damage!`);

    // Check battle state and handle monster turn
    if (!checkBattleEnd()) {
      setTimeout(monsterTurn, 500);
    }
  });

  // Event handler for defend
  document.getElementById("defendBtn").addEventListener("click", () => {
    if (isBattleOver) return;

    isPlayerDefending = true;
    log(
      "You take a defensive stance! Incoming damage will be reduced.",
      "normal"
    );

    // Recover some MP when defending
    const mpRecovery = Math.floor(stats.mp.max * 0.1);
    stats.mp.current = Math.min(stats.mp.max, stats.mp.current + mpRecovery);
    updatePlayerStats();

    if (mpRecovery > 0) {
      log(`You recovered ${mpRecovery} MP while defending.`, "success");
    }

    setTimeout(monsterTurn, 500);
  });

  // Event handler for special attack
  document.getElementById("specialBtn").addEventListener("click", () => {
    if (isBattleOver) return;

    const mpCost = parseInt(
      document.getElementById("specialBtn").dataset.mpCost
    );

    // Check if player has enough MP
    if (stats.mp.current < mpCost) {
      log(`Not enough MP! You need ${mpCost} MP to use this skill.`, "error");
      return;
    }

    // Find first alive monster
    const target = monsters.find((m) => m.currentHp > 0);
    if (!target) return;

    // Get skill details
    const skill = specialSkills[weapon.variant] || specialSkills.common;

    // Calculate damage
    const baseDamage = (weapon.atk || 5) + 10 + Math.floor(Math.random() * 5);
    const skillDamage = Math.floor(baseDamage * skill.damageMultiplier);
    const finalDamage = Math.max(1, skillDamage - Math.floor(target.def / 3));

    // Apply damage and consume MP
    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    stats.mp.current -= mpCost;

    // Update displays
    updateMonsterHP(target);
    updatePlayerStats();

    // Log special attack
    log(
      `You use ${skill.name} on ${target.name} for ${finalDamage} damage!`,
      "success"
    );

    // Apply special effects based on skill
    if (skill.effect && skill.effect !== "normal" && target.currentHp > 0) {
      log(`${target.name} is affected by ${skill.effect}!`, "success");
      // Effect implementation would go here
    }

    // Check battle state and handle monster turn
    if (!checkBattleEnd()) {
      setTimeout(monsterTurn, 500);
    }
  });

  // Event handler for escape
  document.getElementById("escapeBtn").addEventListener("click", () => {
    if (isBattleOver) return;

    // 50% chance to escape successfully
    const escapeChance = 50 - stage * 5;
    const escapeRoll = Math.random() * 100;

    if (escapeRoll <= escapeChance) {
      log("You successfully escaped from battle!", "success");
      isBattleOver = true;

      setTimeout(() => {
        showNotification("You escaped from battle!", "warning");
        // Code to return to previous screen would go here
      }, 1000);
    } else {
      log("Failed to escape!", "error");
      setTimeout(monsterTurn, 500);
    }
  });
}

/**
 * Award battle rewards to the player
 * @param {number} stage - Current battle stage
 */
function giveBattleReward(stage) {
  // Better reward system with stage scaling
  const baseDropChance = 40;
  const stageBonus = stage * 5;
  const dropChance = Math.min(baseDropChance + stageBonus, 95);

  // Award gold based on stage
  const goldAmount = 20 * stage + Math.floor(Math.random() * (10 * stage));

  // Award XP based on stage
  const xpAmount = 50 * stage + Math.floor(Math.random() * (20 * stage));

  // Handle item drops
  if (Math.random() * 100 <= dropChance) {
    // Weight categories based on rarity
    const categoryWeights = {
      gold: 35,
      potions: 25,
      food: 20,
      weapons: 12,
      armors: 8,
    };

    // Select category based on weights
    const totalWeight = Object.values(categoryWeights).reduce(
      (sum, w) => sum + w,
      0
    );
    let roll = Math.random() * totalWeight;

    let selectedCategory = "gold";
    for (const [category, weight] of Object.entries(categoryWeights)) {
      if (roll < weight) {
        selectedCategory = category;
        break;
      }
      roll -= weight;
    }

    // Select item from category
    const itemArray = Items[selectedCategory];
    const itemIndex = Math.min(
      Math.floor(Math.random() * itemArray.length),
      itemArray.length - 1
    );

    const reward = { ...itemArray[itemIndex] };

    // Add item to inventory
    playerInventory.push(reward);

    // Show notification
    showNotification(
      `Reward: ${reward.name} (${reward.variant || "common"})`,
      "success"
    );

    // Log the reward
    const logEl = document.getElementById("battle-log");
    if (logEl) {
      const entry = document.createElement("div");
      entry.className = "log-entry log-success";
      entry.textContent = `🎁 You obtained: ${reward.name} (${
        reward.variant || "common"
      })`;
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }
  }
}
