// Import quest data and utilities
import { showNotification } from "../scripts/demo.js";

// Mock quest data if external file doesn't exist
const MOCK_QUESTS = [
  {
    id: "quest_001",
    title: "The Goblin Menace",
    description:
      "Eliminate the goblins that have been terrorizing the nearby village.",
    type: "kill",
    difficulty: "Easy",
    location: "Greenwood Forest",
    requirements: [
      {
        type: "kill",
        enemy: "Goblin",
        count: 5,
      },
    ],
    rewards: {
      exp: 150,
      gold: 50,
      items: [{ id: "potion_health_minor", count: 2 }],
    },
  },
  {
    id: "quest_002",
    title: "Herb Gathering",
    description: "Collect medicinal herbs for the village healer.",
    type: "collect",
    difficulty: "Easy",
    location: "Forest Outskirts",
    requirements: [
      {
        type: "item",
        id: "healing_herb",
        count: 10,
      },
    ],
    rewards: {
      exp: 75,
      gold: 25,
      items: [],
    },
  },
  {
    id: "quest_003",
    title: "The Lost Artifact",
    description: "Retrieve the ancient crystal from the abandoned temple.",
    type: "fetch",
    difficulty: "Hard",
    location: "Ancient Temple",
    requirements: [
      {
        type: "item",
        id: "crystal_of_power",
        count: 1,
      },
    ],
    rewards: {
      exp: 300,
      gold: 150,
      items: [{ id: "ring_health", count: 1 }],
    },
  },
];

// Mock player quest progress
const MOCK_PLAYER_QUESTS = [
  {
    id: "quest_001",
    status: "in-progress",
    startedAt: Date.now() - 3600000, // 1 hour ago
    progress: {
      kill: {
        Goblin: 3,
      },
    },
  },
  {
    id: "quest_002",
    status: "completed",
    startedAt: Date.now() - 7200000, // 2 hours ago
    completedAt: Date.now() - 1800000, // 30 minutes ago
    progress: {
      item: {
        healing_herb: 10,
      },
    },
  },
];

// Try to import external data, fallback to mock data
let QUESTS, playerQuests;

try {
  // Attempt to import from external files
  const questModule = await import("../data/quests.js").catch(() => null);
  if (questModule) {
    QUESTS = questModule.QUESTS || MOCK_QUESTS;
    playerQuests = questModule.playerQuests || MOCK_PLAYER_QUESTS;
  } else {
    throw new Error("External quest data not found");
  }
} catch (error) {
  console.warn("Using mock quest data:", error.message);
  QUESTS = MOCK_QUESTS;
  playerQuests = MOCK_PLAYER_QUESTS;
}

export default function QuestsView(props = {}) {
  const { activeQuests = [], completedQuests = [] } = props;

  // Get quest data with fallback
  const activePlayerQuests =
    activeQuests.length > 0
      ? activeQuests
      : playerQuests.filter((q) => q.status === "in-progress");

  const completedPlayerQuests =
    completedQuests.length > 0
      ? completedQuests
      : playerQuests.filter((q) => q.status === "completed");

  // Get available quests (not yet started)
  const startedQuestIds = playerQuests.map((q) => q.id);
  const availableQuests = QUESTS.filter((q) => !startedQuestIds.includes(q.id));

  return `
    <section class="quests-view">
      <header class="quests-header">
        <h2>📜 Quest Journal</h2>
        <div class="quest-stats">
          <div class="stat-item">
            <span class="stat-label">Active:</span>
            <span class="stat-value">${activePlayerQuests.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completed:</span>
            <span class="stat-value">${completedPlayerQuests.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Available:</span>
            <span class="stat-value">${availableQuests.length}</span>
          </div>
        </div>
        <div class="quest-filters">
          <button class="filter-btn active" data-filter="active" aria-pressed="true">
            Active (${activePlayerQuests.length})
          </button>
          <button class="filter-btn" data-filter="completed" aria-pressed="false">
            Completed (${completedPlayerQuests.length})
          </button>
          <button class="filter-btn" data-filter="available" aria-pressed="false">
            Available (${availableQuests.length})
          </button>
          <button class="filter-btn" data-filter="all" aria-pressed="false">
            All Quests
          </button>
        </div>
      </header>
      
      <div class="quests-container" id="questsContainer">
        <!-- Active Quests -->
        <div class="quest-group active-quests" data-filter="active">
          <h3 class="quest-group-title">🔥 Active Quests</h3>
          ${renderQuestSection(activePlayerQuests, "active")}
        </div>
        
        <!-- Available Quests -->
        <div class="quest-group available-quests" data-filter="available" style="display: none;">
          <h3 class="quest-group-title">📋 Available Quests</h3>
          ${renderAvailableQuests(availableQuests)}
        </div>
        
        <!-- Completed Quests -->
        <div class="quest-group completed-quests" data-filter="completed" style="display: none;">
          <h3 class="quest-group-title">✅ Completed Quests</h3>
          ${renderQuestSection(completedPlayerQuests, "completed")}
        </div>
      </div>
      
      <footer class="quests-footer">
        <button class="btn back-btn" id="backButton" aria-label="Return to dashboard">
          <span class="btn-icon">⬅️</span>
          <span>Back</span>
        </button>
      </footer>
    </section>
  `;
}

// Render quest section with error handling
function renderQuestSection(playerQuests, type) {
  if (!playerQuests || playerQuests.length === 0) {
    const emptyMessages = {
      active:
        "No active quests. Check the available quests to start your adventure!",
      completed: "You haven't completed any quests yet. Keep adventuring!",
      available: "No new quests available at the moment. Check back later!",
    };

    return `<div class="empty-state">
      <div class="empty-icon">📜</div>
      <p>${emptyMessages[type] || "No quests found."}</p>
    </div>`;
  }

  return playerQuests
    .map((playerQuest) => {
      const quest = QUESTS.find((q) => q.id === playerQuest.id);
      if (!quest) {
        console.warn(`Quest not found: ${playerQuest.id}`);
        return `<div class="quest-card error">
        <p>Quest data not found for ID: ${playerQuest.id}</p>
      </div>`;
      }
      return createQuestCard(quest, playerQuest);
    })
    .join("");
}

// Render available quests
function renderAvailableQuests(quests) {
  if (!quests || quests.length === 0) {
    return `<div class="empty-state">
      <div class="empty-icon">🎯</div>
      <p>No new quests available. Complete current quests to unlock more!</p>
    </div>`;
  }

  return quests.map((quest) => createAvailableQuestCard(quest)).join("");
}

// Create quest card for active/completed quests
function createQuestCard(quest, playerQuest) {
  if (!quest || !playerQuest) {
    return `<div class="quest-card error">Invalid quest data</div>`;
  }

  const isActive = playerQuest.status === "in-progress";
  const isCompleted = playerQuest.status === "completed";

  // Calculate progress
  const progressData = calculateProgress(quest, playerQuest);

  // Format rewards
  const rewardsHTML = formatRewards(quest.rewards);

  // Format duration
  const durationHTML = formatDuration(playerQuest);

  return `
    <div class="quest-card ${playerQuest.status} difficulty-${
    quest.difficulty?.toLowerCase() || "easy"
  }" 
         data-quest-id="${quest.id}">
      <div class="quest-card-header">
        <div class="quest-title-section">
          <h4 class="quest-title">${quest.title}</h4>
          <div class="quest-meta">
            <span class="quest-difficulty ${
              quest.difficulty?.toLowerCase() || "easy"
            }">${quest.difficulty || "Easy"}</span>
            <span class="quest-location">📍 ${
              quest.location || "Unknown"
            }</span>
          </div>
        </div>
        <div class="quest-status-badge ${playerQuest.status}">
          ${getStatusIcon(playerQuest.status)} ${formatStatus(
    playerQuest.status
  )}
        </div>
      </div>
      
      <div class="quest-card-content">
        <p class="quest-description">${quest.description}</p>
        
        ${progressData.html}
        
        <div class="quest-details">
          <div class="quest-requirements">
            <h5>📋 Objectives:</h5>
            <ul class="requirements-list">
              ${quest.requirements
                .map(
                  (req) => `
                <li class="requirement-item ${
                  progressData.completed ? "completed" : ""
                }">
                  ${formatRequirement(req, playerQuest.progress)}
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
          
          <div class="quest-rewards">
            <h5>🎁 Rewards:</h5>
            ${rewardsHTML}
          </div>
        </div>

        ${durationHTML}
      </div>
      
      <div class="quest-card-footer">
        ${getQuestActions(quest, playerQuest)}
      </div>
    </div>
  `;
}

// Create available quest card
function createAvailableQuestCard(quest) {
  const rewardsHTML = formatRewards(quest.rewards);

  return `
    <div class="quest-card available difficulty-${
      quest.difficulty?.toLowerCase() || "easy"
    }" 
         data-quest-id="${quest.id}">
      <div class="quest-card-header">
        <div class="quest-title-section">
          <h4 class="quest-title">${quest.title}</h4>
          <div class="quest-meta">
            <span class="quest-difficulty ${
              quest.difficulty?.toLowerCase() || "easy"
            }">${quest.difficulty || "Easy"}</span>
            <span class="quest-location">📍 ${
              quest.location || "Unknown"
            }</span>
          </div>
        </div>
        <div class="quest-status-badge available">
          📌 Available
        </div>
      </div>
      
      <div class="quest-card-content">
        <p class="quest-description">${quest.description}</p>
        
        <div class="quest-details">
          <div class="quest-requirements">
            <h5>📋 Objectives:</h5>
            <ul class="requirements-list">
              ${quest.requirements
                .map(
                  (req) => `
                <li class="requirement-item">
                  ${formatRequirement(req)}
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
          
          <div class="quest-rewards">
            <h5>🎁 Rewards:</h5>
            ${rewardsHTML}
          </div>
        </div>
      </div>
      
      <div class="quest-card-footer">
        <button class="btn btn-primary quest-accept-btn" data-action="accept" data-quest-id="${
          quest.id
        }">
          <span class="btn-icon">✅</span> Accept Quest
        </button>
      </div>
    </div>
  `;
}

// Helper functions
function calculateProgress(quest, playerQuest) {
  if (!playerQuest.progress || !quest.requirements) {
    return { html: "", completed: false, percentage: 0 };
  }

  const req = quest.requirements[0]; // Simplified: handle first requirement
  let current = 0;
  let max = req.count || 1;
  let progressHTML = "";

  if (req.type === "kill" && playerQuest.progress.kill) {
    current = playerQuest.progress.kill[req.enemy] || 0;
    progressHTML = `
      <div class="quest-progress">
        <div class="progress-label">
          <span class="progress-text">Defeated: ${current}/${max} ${
      req.enemy
    }</span>
          <span class="progress-percentage">${Math.round(
            (current / max) * 100
          )}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${
            (current / max) * 100
          }%"></div>
        </div>
      </div>
    `;
  } else if (req.type === "item" && playerQuest.progress.item) {
    current = playerQuest.progress.item[req.id] || 0;
    progressHTML = `
      <div class="quest-progress">
        <div class="progress-label">
          <span class="progress-text">Collected: ${current}/${max} ${req.id.replace(
      "_",
      " "
    )}</span>
          <span class="progress-percentage">${Math.round(
            (current / max) * 100
          )}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${
            (current / max) * 100
          }%"></div>
        </div>
      </div>
    `;
  }

  return {
    html: progressHTML,
    completed: current >= max,
    percentage: (current / max) * 100,
  };
}

function formatRewards(rewards) {
  if (!rewards) return '<p class="no-rewards">No rewards</p>';

  const items = [];

  if (rewards.exp) {
    items.push(
      `<li class="reward-item exp"><span class="reward-icon">✨</span> ${rewards.exp} EXP</li>`
    );
  }

  if (rewards.gold) {
    items.push(
      `<li class="reward-item gold"><span class="reward-icon">💰</span> ${rewards.gold} Gold</li>`
    );
  }

  if (rewards.items && rewards.items.length > 0) {
    rewards.items.forEach((item) => {
      items.push(
        `<li class="reward-item item"><span class="reward-icon">🎁</span> ${
          item.count
        }x ${item.id.replace("_", " ")}</li>`
      );
    });
  }

  return `<ul class="rewards-list">${items.join("")}</ul>`;
}

function formatRequirement(req, progress = {}) {
  const icons = {
    kill: "⚔️",
    item: "📦",
    talk: "💬",
    explore: "🗺️",
  };

  const icon = icons[req.type] || "📋";
  let text = "";

  switch (req.type) {
    case "kill":
      const killCount = progress.kill?.[req.enemy] || 0;
      text = `${icon} Defeat ${req.count} ${req.enemy} (${killCount}/${req.count})`;
      break;
    case "item":
      const itemCount = progress.item?.[req.id] || 0;
      text = `${icon} Collect ${req.count} ${req.id.replace(
        "_",
        " "
      )} (${itemCount}/${req.count})`;
      break;
    default:
      text = `${icon} ${req.description || "Complete objective"}`;
  }

  return text;
}

function formatDuration(playerQuest) {
  if (!playerQuest.startedAt) return "";

  const now = Date.now();
  const started = playerQuest.startedAt;
  const duration = now - started;

  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  let durationText = "";
  if (hours > 0) {
    durationText = `${hours}h ${minutes}m ago`;
  } else {
    durationText = `${minutes}m ago`;
  }

  return `
    <div class="quest-duration">
      <small class="duration-text">Started ${durationText}</small>
    </div>
  `;
}

function getStatusIcon(status) {
  const icons = {
    "in-progress": "🔥",
    completed: "✅",
    failed: "❌",
    available: "📌",
  };
  return icons[status] || "📋";
}

function formatStatus(status) {
  const statusMap = {
    "in-progress": "In Progress",
    completed: "Completed",
    failed: "Failed",
    available: "Available",
  };
  return statusMap[status] || status;
}

function getQuestActions(quest, playerQuest) {
  const isActive = playerQuest.status === "in-progress";
  const isCompleted = playerQuest.status === "completed";

  if (isCompleted) {
    return `
      <div class="completion-info">
        <div class="completion-badge">
          <span class="badge-icon">✅</span> 
          <span class="badge-text">Quest Completed!</span>
        </div>
        ${
          playerQuest.completedAt
            ? `
          <small class="completion-time">
            Completed ${new Date(playerQuest.completedAt).toLocaleDateString()}
          </small>
        `
            : ""
        }
      </div>
    `;
  }

  if (isActive) {
    return `
      <div class="quest-actions">
        <button class="btn btn-primary quest-track-btn" data-action="track" data-quest-id="${quest.id}">
          <span class="btn-icon">🔍</span> Track Quest
        </button>
        <button class="btn btn-secondary quest-abandon-btn" data-action="abandon" data-quest-id="${quest.id}">
          <span class="btn-icon">❌</span> Abandon
        </button>
      </div>
    `;
  }

  return "";
}

// Initialize quest interactions when view loads
export function initQuestView() {
  setupQuestFilters();
  setupQuestActions();
}

function setupQuestFilters() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      const filter = e.target.getAttribute("data-filter");

      // Update active filter
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });
      e.target.classList.add("active");
      e.target.setAttribute("aria-pressed", "true");

      // Show/hide quest groups
      document.querySelectorAll(".quest-group").forEach((group) => {
        const groupFilter = group.getAttribute("data-filter");
        if (filter === "all" || filter === groupFilter) {
          group.style.display = "block";
        } else {
          group.style.display = "none";
        }
      });
    }
  });
}

function setupQuestActions() {
  document.addEventListener("click", (e) => {
    if (
      e.target.closest(
        ".quest-track-btn, .quest-abandon-btn, .quest-accept-btn"
      )
    ) {
      const button = e.target.closest("button");
      const action = button.getAttribute("data-action");
      const questId = button.getAttribute("data-quest-id");

      handleQuestAction(action, questId, button);
    }
  });
}

function handleQuestAction(action, questId, button) {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest) {
    showNotification("Quest not found!", "error");
    return;
  }

  switch (action) {
    case "track":
      trackQuest(quest);
      break;
    case "abandon":
      abandonQuest(quest);
      break;
    case "accept":
      acceptQuest(quest);
      break;
  }
}

function trackQuest(quest) {
  showNotification(`Now tracking: ${quest.title}`, "success");
  // TODO: Implement quest tracking in UI
}

function abandonQuest(quest) {
  if (
    confirm(
      `Are you sure you want to abandon "${quest.title}"? Your progress will be lost.`
    )
  ) {
    // Remove from player quests
    const index = playerQuests.findIndex((q) => q.id === quest.id);
    if (index > -1) {
      playerQuests.splice(index, 1);
    }

    showNotification(`Abandoned quest: ${quest.title}`, "warning");

    // Refresh view
    setTimeout(() => {
      if (window.location.hash === "#quests") {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    }, 100);
  }
}

function acceptQuest(quest) {
  // Check if quest already exists
  if (playerQuests.find((q) => q.id === quest.id)) {
    showNotification("Quest already accepted!", "warning");
    return;
  }

  // Add to player quests
  playerQuests.push({
    id: quest.id,
    status: "in-progress",
    startedAt: Date.now(),
    progress: {
      kill: {},
      item: {},
    },
  });

  showNotification(`Quest accepted: ${quest.title}`, "success");

  // Refresh view
  setTimeout(() => {
    if (window.location.hash === "#quests") {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, 100);
}

// Auto-initialize when view is loaded
setTimeout(() => {
  if (document.querySelector(".quests-view")) {
    initQuestView();
  }
}, 100);
