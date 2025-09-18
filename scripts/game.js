/**
 * Hero's Dawn - Game UI Controller
 * Handles UI interactions and game state management
 */
document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const musicBtn = document.getElementById('musicBtn');
  const aboutBtn = document.getElementById('aboutBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const questBtn = document.getElementById('questBtn');
  const inventoryBtn = document.getElementById('inventoryBtn');
  const combatBtn = document.getElementById('combatBtn');
  
  // Panels
  const welcomePanel = document.getElementById('welcomePanel');
  const questPanel = document.getElementById('questPanel');
  const inventoryPanel = document.getElementById('inventoryPanel');
  const combatPanel = document.getElementById('combatPanel');
  
  // Toast notification
  const toast = document.getElementById('toast');
  
  // Stats Toggle Button
  const toggleStatsBtn = document.getElementById('toggleStats');
  const detailedStats = document.getElementById('detailedStats');
  
  if (toggleStatsBtn && detailedStats) {
    toggleStatsBtn.addEventListener('click', () => {
      detailedStats.classList.toggle('show');
      toggleStatsBtn.classList.toggle('active');
      AudioManager.playSfx('click');
    });
  }
  
  // Game state
  const GameState = {
    music: localStorage.getItem('musicEnabled') === 'true' || false,
    currentPanel: 'welcome',
    activeEffects: [],
    equippedItems: {
      weapon: null,
      armor: null,
      shield: null
    },
    character: {
      name: 'Azura',
      level: 5,
      hp: 75,
      maxHp: 100,
      mp: 30,
      maxMp: 60,
      xp: 65, // percentage to next level
      
      // Basic stats
      strength: 14,     // Kekuatan - meningkatkan damage
      intelligence: 8,  // Kecerdasan - meningkatkan mana dan magic damage
      constitution: 12, // Kesehatan - meningkatkan max HP
      agility: 10,      // Kelincahan - meningkatkan dodge chance
      speed: 9,         // Kecepatan - meningkatkan initiative in combat
      defense: 11,      // Pertahanan - mengurangi damage
      criticalDmg: 15,  // Critical Damage - persentase bonus damage
      
      // Calculated stats
      getDamage() {
        // Base damage from strength
        let damage = Math.floor(this.strength * 0.8);
        
        // Add equipped weapon damage
        if (GameState.equippedItems && GameState.equippedItems.weapon) {
          damage += GameState.equippedItems.weapon.stats.damage;
        }
        
        return damage;
      },
      
      getDefense() {
        // Base defense
        let def = this.defense;
        
        // Add equipped armor and shield
        if (GameState.equippedItems) {
          if (GameState.equippedItems.armor) {
            def += GameState.equippedItems.armor.stats.defense;
          }
          if (GameState.equippedItems.shield) {
            def += GameState.equippedItems.shield.stats.defense;
          }
        }
        
        return def;
      },
      
      // Calculate critical hit chance (based on agility)
      getCritChance() {
        return Math.floor(this.agility * 0.8);
      }
    },
    // Item database
    itemTypes: {
      // Weapons
      ironSword: {
        id: 'ironSword',
        name: 'Iron Sword',
        type: 'weapon',
        rarity: 'common',
        stats: {
          damage: 5
        },
        description: 'A basic iron sword. Adds +5 damage.',
        icon: 'sword',
        maxDurability: 3
      },
      steelSword: {
        id: 'steelSword',
        name: 'Steel Sword',
        type: 'weapon',
        rarity: 'uncommon',
        stats: {
          damage: 8
        },
        description: 'A sturdy steel sword. Adds +8 damage.',
        icon: 'steel_sword',
        maxDurability: 5
      },
      mythrilSword: {
        id: 'mythrilSword',
        name: 'Mythril Sword',
        type: 'weapon',
        rarity: 'epic',
        stats: {
          damage: 12
        },
        description: 'A rare mythril sword. Adds +12 damage.',
        icon: 'mythril_sword',
        maxDurability: 7
      },
      // Armor
      leatherArmor: {
        id: 'leatherArmor',
        name: 'Leather Armor',
        type: 'armor',
        rarity: 'common',
        stats: {
          defense: 3
        },
        description: 'Basic leather protection. Adds +3 defense.',
        icon: 'leather_armor',
        maxDurability: 3
      },
      chainArmor: {
        id: 'chainArmor',
        name: 'Chain Mail',
        type: 'armor',
        rarity: 'uncommon',
        stats: {
          defense: 6
        },
        description: 'Sturdy chain mail. Adds +6 defense.',
        icon: 'chain_armor',
        maxDurability: 5
      },
      // Shields
      woodenShield: {
        id: 'woodenShield',
        name: 'Wooden Shield',
        type: 'shield',
        rarity: 'common',
        stats: {
          defense: 2
        },
        description: 'A simple wooden shield. Adds +2 defense.',
        icon: 'shield',
        maxDurability: 3
      },
      ironShield: {
        id: 'ironShield',
        name: 'Iron Shield',
        type: 'shield',
        rarity: 'uncommon',
        stats: {
          defense: 4
        },
        description: 'A sturdy iron shield. Adds +4 defense.',
        icon: 'iron_shield',
        maxDurability: 5
      },
      // Potions
      healthPotion: {
        id: 'healthPotion',
        name: 'Health Potion',
        type: 'consumable',
        subtype: 'health',
        rarity: 'common',
        effect: {
          type: 'instant',
          restore: 0.25 // 25% of max health
        },
        description: 'Restores 25% of max health.',
        icon: 'potion',
        stackable: true,
        maxStack: 12
      },
      manaPotion: {
        id: 'manaPotion',
        name: 'Mana Potion',
        type: 'consumable',
        subtype: 'mana',
        rarity: 'common',
        effect: {
          type: 'instant',
          restore: 0.25 // 25% of max mana
        },
        description: 'Restores 25% of max mana.',
        icon: 'mana_potion',
        stackable: true,
        maxStack: 12
      },
      strengthPotion: {
        id: 'strengthPotion',
        name: 'Strength Potion',
        type: 'consumable',
        subtype: 'buff',
        rarity: 'uncommon',
        effect: {
          type: 'duration',
          duration: 180, // 3 minutes in seconds
          stats: {
            damage: 12,
            defense: 12
          }
        },
        description: 'Increases damage and defense by 12 for 3 minutes.',
        icon: 'strength_potion',
        stackable: true,
        maxStack: 12
      }
    },
    // Player inventory
    inventory: [
      { 
        itemId: 'ironSword', 
        count: 1,
        durability: 3,
        equipped: false
      },
      { 
        itemId: 'woodenShield', 
        count: 1,
        durability: 3,
        equipped: false
      },
      { 
        itemId: 'leatherArmor', 
        count: 1,
        durability: 3,
        equipped: false
      },
      { 
        itemId: 'healthPotion', 
        count: 5 
      },
      { 
        itemId: 'manaPotion', 
        count: 3 
      },
      { 
        itemId: 'strengthPotion', 
        count: 2 
      },
      // Empty slots will be added automatically to fill 16 slots
    ]
  };
  
  // Audio Manager
  const AudioManager = {
    bgm: new Audio('assets/audio/bgm.mp3'),
    sfx: {
      click: new Audio('assets/audio/click.mp3'),
      hover: new Audio('assets/audio/hover.mp3'),
      attack: new Audio('assets/audio/attack.mp3'),
      potion: new Audio('assets/audio/potion.mp3'),
      equip: new Audio('assets/audio/equip.mp3')
    },
    
    init() {
      this.bgm.loop = true;
      this.bgm.volume = 0.5;
      
      // Initialize based on saved state
      if (GameState.music) {
        this.playBgm();
      }
    },
    
    playBgm() {
      this.bgm.play().catch(err => console.warn('Audio autoplay blocked', err));
    },
    
    pauseBgm() {
      this.bgm.pause();
    },
    
    playSfx(name) {
      const sound = this.sfx[name];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.warn('Audio play blocked', err));
      }
    }
  };
  
  // Initialize the game
  function init() {
    AudioManager.init();
    addEventListeners();
    initializeInventory();
    updateCharacterStats();
    
    // Add hover sounds to all buttons
    document.querySelectorAll('button, .inventory-item, .enemy').forEach(button => {
      button.addEventListener('mouseenter', () => {
        AudioManager.playSfx('hover');
      });
    });
  }
  
  // Initialize inventory with 16 slots
  function initializeInventory() {
    const inventoryGrid = document.querySelector('.inventory-grid');
    // Clear existing items
    inventoryGrid.innerHTML = '';
    
    // Ensure inventory has exactly 16 slots (fill with empty slots if needed)
    while (GameState.inventory.length < 16) {
      GameState.inventory.push(null);
    }
    
    // Create each inventory slot
    GameState.inventory.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'inventory-item pixel-border';
      slot.setAttribute('data-slot', index);
      
      if (item) {
        const itemType = GameState.itemTypes[item.itemId];
        if (itemType) {
          // Create item icon
          const icon = document.createElement('div');
          icon.className = `item-icon ${itemType.icon}`;
          slot.appendChild(icon);
          
          // Add item data
          slot.setAttribute('data-item', item.itemId);
          slot.setAttribute('data-rarity', itemType.rarity);
          
          // Add count for stackable items
          if (itemType.stackable && item.count > 1) {
            const count = document.createElement('div');
            count.className = 'item-count';
            count.textContent = `x${item.count}`;
            slot.appendChild(count);
          }
          
          // Show durability for equipment
          if (['weapon', 'armor', 'shield'].includes(itemType.type)) {
            const durability = document.createElement('div');
            durability.className = 'item-durability';
            durability.textContent = `${item.durability}/${itemType.maxDurability}`;
            slot.appendChild(durability);
          }
          
          // Add equipped indicator
          if (item.equipped) {
            slot.classList.add('equipped');
            const equippedBadge = document.createElement('div');
            equippedBadge.className = 'equipped-badge';
            equippedBadge.textContent = 'E';
            slot.appendChild(equippedBadge);
          }
        }
      }
      
      inventoryGrid.appendChild(slot);
    });
    
    // Add click listeners to inventory slots
    document.querySelectorAll('.inventory-item').forEach(slot => {
      slot.addEventListener('click', handleInventoryClick);
    });
  }
  
  // Handle inventory item click
  function handleInventoryClick(e) {
    const slot = e.currentTarget;
    const slotIndex = parseInt(slot.getAttribute('data-slot'));
    const item = GameState.inventory[slotIndex];
    
    if (!item) return; // Empty slot
    
    const itemType = GameState.itemTypes[item.itemId];
    if (!itemType) return;
    
    // Show item details
    showItemTooltip(slot, item, itemType);
    
    // Create context menu
    showItemContextMenu(slot, item, itemType, slotIndex);
  }
  
  // Show item tooltip
  function showItemTooltip(slot, item, itemType) {
    // Create or get tooltip element
    let tooltip = document.getElementById('item-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'item-tooltip';
      tooltip.className = 'item-tooltip pixel-border';
      document.body.appendChild(tooltip);
    }
    
    // Build tooltip content
    let tooltipContent = `
      <div class="tooltip-header ${itemType.rarity}">
        <h3>${itemType.name}</h3>
        <span class="tooltip-rarity">${itemType.rarity}</span>
      </div>
      <div class="tooltip-body">
        <p>${itemType.description}</p>
    `;
    
    // Add stats for equipment
    if (['weapon', 'armor', 'shield'].includes(itemType.type)) {
      tooltipContent += `
        <div class="tooltip-stats">
          ${itemType.stats.damage ? `<div>Damage: +${itemType.stats.damage}</div>` : ''}
          ${itemType.stats.defense ? `<div>Defense: +${itemType.stats.defense}</div>` : ''}
          <div>Durability: ${item.durability}/${itemType.maxDurability}</div>
        </div>
      `;
    }
    
    // Add effect for consumables
    if (itemType.type === 'consumable') {
      if (itemType.subtype === 'health') {
        tooltipContent += `
          <div class="tooltip-effect">
            <div>Restores ${itemType.effect.restore * 100}% HP</div>
          </div>
        `;
      } else if (itemType.subtype === 'mana') {
        tooltipContent += `
          <div class="tooltip-effect">
            <div>Restores ${itemType.effect.restore * 100}% MP</div>
          </div>
        `;
      } else if (itemType.subtype === 'buff') {
        tooltipContent += `
          <div class="tooltip-effect">
            ${itemType.effect.stats.damage ? `<div>+${itemType.effect.stats.damage} Damage</div>` : ''}
            ${itemType.effect.stats.defense ? `<div>+${itemType.effect.stats.defense} Defense</div>` : ''}
            <div>Duration: ${Math.floor(itemType.effect.duration / 60)}:${(itemType.effect.duration % 60).toString().padStart(2, '0')}</div>
          </div>
        `;
      }
    }
    
    tooltipContent += `</div>`;
    
    // Set tooltip content
    tooltip.innerHTML = tooltipContent;
    
    // Position tooltip
    const slotRect = slot.getBoundingClientRect();
    tooltip.style.left = `${slotRect.right + 10}px`;
    tooltip.style.top = `${slotRect.top}px`;
    
    // Show tooltip
    tooltip.classList.add('show');
    
    // Hide tooltip when clicking elsewhere
    document.addEventListener('click', function hideTooltip(e) {
      if (!slot.contains(e.target) && !tooltip.contains(e.target)) {
        tooltip.classList.remove('show');
        document.removeEventListener('click', hideTooltip);
      }
    });
  }
  
  // Show item context menu
  function showItemContextMenu(slot, item, itemType, slotIndex) {
    // Create or get context menu
    let contextMenu = document.getElementById('context-menu');
    if (!contextMenu) {
      contextMenu = document.createElement('div');
      contextMenu.id = 'context-menu';
      contextMenu.className = 'context-menu pixel-border';
      document.body.appendChild(contextMenu);
    }
    
    // Clear existing menu
    contextMenu.innerHTML = '';
    
    // Add actions based on item type
    if (['weapon', 'armor', 'shield'].includes(itemType.type)) {
      // Equip/Unequip
      const equipBtn = document.createElement('button');
      equipBtn.className = 'context-btn';
      equipBtn.textContent = item.equipped ? 'Unequip' : 'Equip';
      equipBtn.addEventListener('click', () => {
        toggleEquipItem(item, itemType, slotIndex);
        contextMenu.classList.remove('show');
        AudioManager.playSfx('equip');
      });
      contextMenu.appendChild(equipBtn);
    }
    
    if (itemType.type === 'consumable') {
      // Use consumable
      const useBtn = document.createElement('button');
      useBtn.className = 'context-btn';
      useBtn.textContent = 'Use';
      useBtn.addEventListener('click', () => {
        useConsumable(item, itemType, slotIndex);
        contextMenu.classList.remove('show');
        AudioManager.playSfx('potion');
      });
      contextMenu.appendChild(useBtn);
    }
    
    // Position context menu
    const slotRect = slot.getBoundingClientRect();
    contextMenu.style.left = `${slotRect.left}px`;
    contextMenu.style.top = `${slotRect.bottom + 5}px`;
    
    // Show context menu
    contextMenu.classList.add('show');
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', function hideContextMenu(e) {
      if (!slot.contains(e.target) && !contextMenu.contains(e.target)) {
        contextMenu.classList.remove('show');
        document.removeEventListener('click', hideContextMenu);
      }
    });
  }
  
  // Toggle equip/unequip item
  function toggleEquipItem(item, itemType, slotIndex) {
    if (item.equipped) {
      // Unequip item
      item.equipped = false;
      
      // Remove from equipped items
      GameState.equippedItems[itemType.type] = null;
      
      showToast(`${itemType.name} unequipped`);
    } else {
      // Unequip any currently equipped item of the same type
      GameState.inventory.forEach(invItem => {
        if (invItem && invItem.equipped && GameState.itemTypes[invItem.itemId].type === itemType.type) {
          invItem.equipped = false;
        }
      });
      
      // Equip new item
      item.equipped = true;
      
      // Add to equipped items
      GameState.equippedItems[itemType.type] = itemType;
      
      showToast(`${itemType.name} equipped`);
    }
    
    // Update inventory display
    initializeInventory();
    
    // Update character stats
    updateCharacterStats();
  }
  
  // Use consumable item
  function useConsumable(item, itemType, slotIndex) {
    if (itemType.subtype === 'health') {
      // Health potion
      const healAmount = Math.floor(GameState.character.maxHp * itemType.effect.restore);
      GameState.character.restoreHp(healAmount);
      showToast(`Restored ${healAmount} HP`);
    } else if (itemType.subtype === 'mana') {
      // Mana potion
      const manaAmount = Math.floor(GameState.character.maxMp * itemType.effect.restore);
      GameState.character.restoreMp(manaAmount);
      showToast(`Restored ${manaAmount} MP`);
    } else if (itemType.subtype === 'buff') {
      // Buff potion (like strength potion)
      applyBuffEffect(itemType);
      showToast(`${itemType.name} activated for ${Math.floor(itemType.effect.duration / 60)} minutes`);
    }
    
    // Reduce item count or remove if last one
    item.count--;
    if (item.count <= 0) {
      GameState.inventory[slotIndex] = null;
    }
    
    // Update inventory display
    initializeInventory();
  }
  
  // Apply buff effect
  function applyBuffEffect(itemType) {
    // Create a new active effect
    const effect = {
      id: `effect_${Date.now()}`,
      name: itemType.name,
      icon: itemType.icon,
      stats: itemType.effect.stats,
      remainingTime: itemType.effect.duration,
      endTime: Date.now() + (itemType.effect.duration * 1000)
    };
    
    // Add to active effects
    GameState.activeEffects.push(effect);
    
    // Update character stats
    updateCharacterStats();
    
    // Create or update the buff indicator
    updateBuffIndicators();
    
    // Start the timer for this effect
    startEffectTimer(effect);
  }
  
  // Start timer for effect
  function startEffectTimer(effect) {
    const timer = setInterval(() => {
      // Check if effect should still be active
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((effect.endTime - now) / 1000));
      
      if (timeLeft <= 0) {
        // Remove effect
        GameState.activeEffects = GameState.activeEffects.filter(e => e.id !== effect.id);
        updateBuffIndicators();
        updateCharacterStats();
        clearInterval(timer);
      } else {
        // Update remaining time
        effect.remainingTime = timeLeft;
        updateBuffIndicators();
      }
    }, 1000);
  }
  
  // Update buff indicators
  function updateBuffIndicators() {
    // Get or create buff container
    let buffContainer = document.querySelector('.buff-container');
    if (!buffContainer) {
      buffContainer = document.createElement('div');
      buffContainer.className = 'buff-container';
      document.querySelector('.character-panel').appendChild(buffContainer);
    }
    
    // Clear existing buffs
    buffContainer.innerHTML = '';
    
    // Add each active effect
    GameState.activeEffects.forEach(effect => {
      const buffIcon = document.createElement('div');
      buffIcon.className = 'buff-icon pixel-border';
      
      // Icon
      const icon = document.createElement('div');
      icon.className = `buff-icon-img ${effect.icon}`;
      buffIcon.appendChild(icon);
      
      // Timer
      const timer = document.createElement('div');
      timer.className = 'buff-timer';
      const minutes = Math.floor(effect.remainingTime / 60);
      const seconds = effect.remainingTime % 60;
      timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      buffIcon.appendChild(timer);
      
      // Tooltip
      buffIcon.setAttribute('title', `${effect.name}: ${Object.entries(effect.stats).map(([stat, value]) => `+${value} ${stat}`).join(', ')}`);
      
      buffContainer.appendChild(buffIcon);
    });
  }
  
  // Function to update all character stats in the UI
  function updateCharacterStats() {
    // Update HP, MP, XP bars
    document.querySelector('.hp-bar .stat-fill').style.width = `${(GameState.character.hp / GameState.character.maxHp) * 100}%`;
    document.querySelector('.hp-bar .stat-text').textContent = `${GameState.character.hp}/${GameState.character.maxHp}`;
    
    document.querySelector('.mp-bar .stat-fill').style.width = `${(GameState.character.mp / GameState.character.maxMp) * 100}%`;
    document.querySelector('.mp-bar .stat-text').textContent = `${GameState.character.mp}/${GameState.character.maxMp}`;
    
    document.querySelector('.xp-bar .stat-fill').style.width = `${GameState.character.xp}%`;
    document.querySelector('.xp-bar .stat-text').textContent = `${GameState.character.xp}%`;
    
    // Update detailed stats
    const detailedStats = document.querySelectorAll('.detailed-stat .stat-value');
    if (detailedStats.length >= 7) {
      detailedStats[0].textContent = GameState.character.strength;
      detailedStats[1].textContent = GameState.character.intelligence;
      detailedStats[2].textContent = GameState.character.constitution;
      detailedStats[3].textContent = GameState.character.agility;
      detailedStats[4].textContent = GameState.character.speed;
      detailedStats[5].textContent = GameState.character.defense;
      detailedStats[6].textContent = GameState.character.criticalDmg + '%';
    }
  }
  
  // Handle equipment durability in combat
  function useEquipmentInCombat() {
    // Reduce durability for all equipped items
    for (const type in GameState.equippedItems) {
      const equipped = GameState.equippedItems[type];
      if (equipped) {
        // Find the item in inventory
        const inventoryIndex = GameState.inventory.findIndex(item => 
          item && item.itemId === equipped.id && item.equipped
        );
        
        if (inventoryIndex !== -1) {
          const item = GameState.inventory[inventoryIndex];
          item.durability--;
          
          // Check if item broke
          if (item.durability <= 0) {
            item.equipped = false;
            GameState.equippedItems[type] = null;
            GameState.inventory[inventoryIndex] = null;
            showToast(`Your ${equipped.name} broke!`, 'warning');
          }
        }
      }
    }
    
    // Update inventory and stats
    initializeInventory();
    updateCharacterStats();
  }
  
  // Add event listeners
  function addEventListeners() {
    // Top navigation
    musicBtn.addEventListener('click', toggleMusic);
    aboutBtn.addEventListener('click', showAbout);
    settingsBtn.addEventListener('click', showSettings);
    
    // Side navigation
    questBtn.addEventListener('click', () => showPanel('quest'));
    inventoryBtn.addEventListener('click', () => showPanel('inventory'));
    combatBtn.addEventListener('click', () => showPanel('combat'));
    
    // Enemy selection
    document.querySelectorAll('.enemy').forEach(enemy => {
      enemy.addEventListener('click', () => {
        const enemyName = enemy.querySelector('.enemy-name').textContent;
        showToast(`Preparing battle with ${enemyName}...`);
        AudioManager.playSfx('attack');
        
        // Simulate combat and reduce equipment durability
        useEquipmentInCombat();
      });
    });
  }
  
  // Toggle music on/off
  function toggleMusic() {
    GameState.music = !GameState.music;
    localStorage.setItem('musicEnabled', GameState.music);
    
    if (GameState.music) {
      AudioManager.playBgm();
      showToast('Music: ON');
    } else {
      AudioManager.pauseBgm();
      showToast('Music: OFF');
    }
    
    AudioManager.playSfx('click');
  }
  
  // Show about dialog
  function showAbout() {
    AudioManager.playSfx('click');
    showToast('About: Hero\'s Dawn v1.0');
    // In a real game, you'd show a modal here
  }
  
  // Show settings dialog
  function showSettings() {
    AudioManager.playSfx('click');
    showToast('Settings menu');
    // In a real game, you'd show a modal here
  }
  
  // Switch between panels
  function showPanel(panelName) {
    // Hide all panels
    welcomePanel.classList.remove('active');
    questPanel.classList.remove('active');
    inventoryPanel.classList.remove('active');
    combatPanel.classList.remove('active');
    
    // Remove active class from all nav buttons
    questBtn.classList.remove('active');
    inventoryBtn.classList.remove('active');
    combatBtn.classList.remove('active');
    
    // Show selected panel
    switch (panelName) {
      case 'quest':
        questPanel.classList.add('active');
        questBtn.classList.add('active');
        showToast('Quest Log');
        break;
      case 'inventory':
        inventoryPanel.classList.add('active');
        inventoryBtn.classList.add('active');
        showToast('Inventory');
        break;
      case 'combat':
        combatPanel.classList.add('active');
        combatBtn.classList.add('active');
        showToast('Combat Arena');
        break;
      default:
        welcomePanel.classList.add('active');
        break;
    }
    
    GameState.currentPanel = panelName;
    AudioManager.playSfx('click');
  }
  
  // Show toast notification
  function showToast(message, type = 'info', duration = 3000) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
  
  // Initialize the game
  init();
});