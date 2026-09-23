const quests = [
  { id: 1, title: "Rescatar al herrero", reward: 100 },
  { id: 2, title: "Derrotar al dragon", reward: 500 },
];
let nextId = 3;

function listQuests() {
  return quests;
}

function getQuestById(id) {
  return quests.find((q) => q.id === Number(id)) || null;
}

function createQuest({ title, reward }) {
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("title es obligatorio");
  }
  const numericReward = Number(reward);
  if (!reward || Number.isNaN(numericReward) || numericReward <= 0) {
    throw new Error("reward debe ser un numero mayor a 0");
  }

  const quest = { id: nextId++, title: title.trim(), reward: numericReward };
  quests.push(quest);
  return quest;
}

function deleteQuest(id) {
  const index = quests.findIndex((q) => q.id === Number(id));
  if (index === -1) return false;
  quests.splice(index, 1);
  return true;
}

export { listQuests, getQuestById, createQuest, deleteQuest };
