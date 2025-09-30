// Daftar quest yang tersedia dalam game
export const QUESTS = [
  {
    id: "quest_001",
    title: "The Lost Sword",
    description: "Temukan pedang legendaris yang hilang di hutan gelap.",
    requirements: [
      { type: "item", id: "sword_001", count: 1 }, // butuh punya Iron Sword
    ],
    rewards: {
      exp: 100,
      gold: 50,
      items: [{ id: "potion_001", count: 2 }],
    },
    status: "available",
  },
  {
    id: "quest_002",
    title: "Potion Delivery",
    description: "Antarkan 3 Health Potion kepada alkemis desa.",
    requirements: [{ type: "item", id: "potion_001", count: 3 }],
    rewards: {
      exp: 50,
      gold: 20,
    },
    status: "locked",
  },
  {
    id: "quest_003",
    title: "Defend the Village",
    description: "Kalahkan 5 monster goblin yang menyerang desa.",
    requirements: [{ type: "kill", enemy: "goblin", count: 5 }],
    rewards: {
      exp: 150,
      gold: 100,
      items: [{ id: "shield_001", count: 1 }],
    },
    status: "in-progress",
  },
];

// Daftar quest player (progress)
export let playerQuests = [
  { id: "quest_001", status: "completed" },
  { id: "quest_002", status: "locked" },
  { id: "quest_003", status: "in-progress", progress: { kill: { goblin: 2 } } },
];
