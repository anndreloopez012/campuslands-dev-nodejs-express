const inMemoryClubs = [
  {
    id: "CLB-01",
    clubName: "Inter Movistar Futsal",
    modality: "Futbol_Sala_FIFA",
    wins: 14,
    draws: 3,
    losses: 1,
    goalsFor: 68,
    goalsAgainst: 29,
    createdAt: "2026-10-01T12:00:00.000Z"
  },
  {
    id: "CLB-02",
    clubName: "Barça Futsal",
    modality: "Futbol_Sala_FIFA",
    wins: 13,
    draws: 2,
    losses: 3,
    goalsFor: 61,
    goalsAgainst: 34,
    createdAt: "2026-10-02T12:00:00.000Z"
  }
];

export const findAllClubs = async () => [...inMemoryClubs];

export const findClubById = async (id) => {
  const item = inMemoryClubs.find((c) => c.id === String(id));
  return item ? { ...item } : null;
};

export const findClubByName = async (name) => {
  const item = inMemoryClubs.find(
    (c) => c.clubName.toLowerCase() === name.trim().toLowerCase()
  );
  return item ? { ...item } : null;
};

export const saveClub = async (data) => {
  const newItem = { ...data };
  inMemoryClubs.push(newItem);
  return { ...newItem };
};
