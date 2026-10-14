// Estructura privada en memoria RAM
const inMemoryMatches = [
  {
    id: "1",
    matchCode: "FUT-MEM-01",
    tournament: "Liga Nacional de Futsal",
    homeTeam: "Inter Movistar",
    awayTeam: "ElPozo Murcia",
    homeGoals: 5,
    awayGoals: 3,
    surface: "Parquet",
    status: "Finished"
  },
  {
    id: "2",
    matchCode: "FUT-MEM-02",
    tournament: "Copa de España Futsal",
    homeTeam: "Barça Futsal",
    awayTeam: "Palma Futsal",
    homeGoals: 2,
    awayGoals: 2,
    surface: "Sintético",
    status: "Live"
  }
];

export const findAll = async () => {
  return [...inMemoryMatches];
};

export const findById = async (id) => {
  const match = inMemoryMatches.find((m) => m.id === String(id));
  return match ? { ...match } : null;
};

export const findByCode = async (matchCode) => {
  const match = inMemoryMatches.find(
    (m) => m.matchCode.toLowerCase() === matchCode.toLowerCase()
  );
  return match ? { ...match } : null;
};

export const save = async (matchData) => {
  const newMatch = { ...matchData };
  inMemoryMatches.push(newMatch);
  return { ...newMatch };
};

export const update = async (id, updatedFields) => {
  const index = inMemoryMatches.findIndex((m) => m.id === String(id));
  if (index === -1) return null;

  inMemoryMatches[index] = {
    ...inMemoryMatches[index],
    ...updatedFields,
    id: String(id)
  };

  return { ...inMemoryMatches[index] };
};

export const remove = async (id) => {
  const index = inMemoryMatches.findIndex((m) => m.id === String(id));
  if (index === -1) return false;

  inMemoryMatches.splice(index, 1);
  return true;
};