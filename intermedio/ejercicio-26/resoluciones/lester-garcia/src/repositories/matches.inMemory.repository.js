const inMemoryMatches = [
  {
    id: "MTC-01",
    playerTag: "Aspas#BR1",
    mapName: "Ascent",
    kills: 28,
    deaths: 12,
    kdRatio: 2.33,
    headshotPercentage: 34,
    anticheatTrustScore: 99,
    createdAt: "2026-10-12T19:00:00.000Z"
  }
];

export const matchesRepository = {
  async findAll() {
    return [...inMemoryMatches];
  },
  async findById(id) {
    const item = inMemoryMatches.find((m) => m.id === String(id));
    return item ? { ...item } : null;
  },
  async save(data) {
    const newItem = { ...data };
    inMemoryMatches.push(newItem);
    return { ...newItem };
  }
};
