const inMemoryFighters = [
  {
    id: "1",
    name: "Rico Verhoeven",
    nickname: "The King of Kickboxing",
    weightClass: "Peso Pesado",
    stance: "Ortodoxo",
    record: { wins: 64, losses: 10, knockouts: 21 },
    isActive: true
  },
  {
    id: "2",
    name: "Giorgio Petrosyan",
    nickname: "The Doctor",
    weightClass: "Peso Ligero",
    stance: "Zurdo",
    record: { wins: 105, losses: 3, knockouts: 42 },
    isActive: true
  },
  {
    id: "3",
    name: "Artem Vakhitov",
    nickname: "The Sniper",
    weightClass: "Peso Wélter",
    stance: "Ortodoxo",
    record: { wins: 23, losses: 6, knockouts: 8 },
    isActive: true
  },
  {
    id: "4",
    name: "Alex Pereira",
    nickname: "Poatan",
    weightClass: "Peso Mediano",
    stance: "Ortodoxo",
    record: { wins: 33, losses: 7, knockouts: 21 },
    isActive: false
  },
  {
    id: "5",
    name: "Takeru Segawa",
    nickname: "Natural Born Krusher",
    weightClass: "Peso Pluma",
    stance: "Ortodoxo",
    record: { wins: 44, losses: 4, knockouts: 25 },
    isActive: true
  },
  {
    id: "6",
    name: "Badr Hari",
    nickname: "The Golden Boy",
    weightClass: "Peso Pesado",
    stance: "Ortodoxo",
    record: { wins: 106, losses: 17, knockouts: 92 },
    isActive: false
  },
  {
    id: "7",
    name: "Chingiz Allazov",
    nickname: "Chingo",
    weightClass: "Peso Ligero",
    stance: "Cambio de Guardia",
    record: { wins: 61, losses: 5, knockouts: 37 },
    isActive: true
  },
  {
    id: "8",
    name: "Sitthichai Sitsongpeenong",
    nickname: "The Killer Kid",
    weightClass: "Peso Ligero",
    stance: "Zurdo",
    record: { wins: 128, losses: 34, knockouts: 39 },
    isActive: true
  }
];

export const findAndPaginate = async ({ filterFn, skip, limit }) => {
  // 1. Aplicar filtros sobre la colección completa
  const filtered = inMemoryFighters.filter(filterFn);
  const totalCount = filtered.length;

  // 2. Aplicar offset y corte por límite
  const paginatedResults = filtered.slice(skip, skip + limit);

  return {
    items: [...paginatedResults],
    totalCount
  };
};

export const findById = async (id) => {
  const fighter = inMemoryFighters.find((f) => f.id === String(id));
  return fighter ? { ...fighter } : null;
};