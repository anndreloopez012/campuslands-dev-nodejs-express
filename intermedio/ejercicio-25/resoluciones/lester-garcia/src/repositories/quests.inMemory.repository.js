const inMemoryQuests = [
  {
    id: "QST-01",
    title: "Cacería del Wyvern de Ceniza",
    region: "Cordillera Dracónica",
    difficultyRank: "Mitril",
    recommendedLevel: 45,
    goldReward: 3500,
    createdAt: "2026-10-12T10:00:00.000Z"
  },
  {
    id: "QST-02",
    title: "Escolta de Caravana Alquímica",
    region: "Bosque de Eldoria",
    difficultyRank: "Plata",
    recommendedLevel: 15,
    goldReward: 600,
    createdAt: "2026-10-13T11:30:00.000Z"
  }
];

export const findAllQuests = async () => [...inMemoryQuests];

export const findQuestById = async (id) => {
  const item = inMemoryQuests.find((q) => q.id === String(id));
  return item ? { ...item } : null;
};

export const saveQuest = async (data) => {
  const newItem = { ...data };
  inMemoryQuests.push(newItem);
  return { ...newItem };
};
