const inMemoryTournaments = [
  {
    id: "TRN-01",
    name: "Worlds Championship 2026",
    gameTitle: "League of Legends",
    region: "Global",
    prizePoolUsd: 2225000,
    createdAt: "2026-10-05T14:00:00.000Z"
  },
  {
    id: "TRN-02",
    name: "The International Aegis Cup",
    gameTitle: "Dota 2",
    region: "Global",
    prizePoolUsd: 3500000,
    createdAt: "2026-10-08T16:00:00.000Z"
  }
];

export const findAllTournaments = async () => [...inMemoryTournaments];

export const findTournamentById = async (id) => {
  const item = inMemoryTournaments.find((t) => t.id === String(id));
  return item ? { ...item } : null;
};

export const saveTournament = async (data) => {
  const newItem = { ...data };
  inMemoryTournaments.push(newItem);
  return { ...newItem };
};
