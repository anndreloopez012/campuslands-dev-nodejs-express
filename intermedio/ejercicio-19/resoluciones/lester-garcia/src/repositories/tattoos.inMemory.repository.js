const inMemoryTattoos = [
  {
    id: "TAT-01",
    clientName: "Camila Restrepo",
    clientAge: 26,
    tattooStyle: "Blackwork",
    bodyPlacement: "Antebrazo derecho",
    artistName: "Valeria Ink",
    estimatedHours: 4,
    createdAt: "2026-10-15T14:00:00.000Z"
  },
  {
    id: "TAT-02",
    clientName: "Sebastián Mendoza",
    clientAge: 31,
    tattooStyle: "Japones Irezumi",
    bodyPlacement: "Espalda alta",
    artistName: "Kenji Sato",
    estimatedHours: 6,
    createdAt: "2026-10-18T16:30:00.000Z"
  }
];

export const findAllTattoos = async () => [...inMemoryTattoos];

export const findTattooById = async (id) => {
  const session = inMemoryTattoos.find((t) => t.id === String(id));
  return session ? { ...session } : null;
};

export const saveTattoo = async (tattooData) => {
  const newSession = { ...tattooData };
  inMemoryTattoos.push(newSession);
  return { ...newSession };
};
