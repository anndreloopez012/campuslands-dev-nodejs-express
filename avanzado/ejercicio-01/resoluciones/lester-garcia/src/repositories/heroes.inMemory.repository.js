const initialHeroes = [
  {
    id: "HERO-01",
    name: "Arthas Pendragon",
    characterClass: "Paladin",
    level: 45,
    guild: "Orden del Alba",
    stats: {
      attack: 180,
      defense: 240,
      mana: 320,
      critRate: 18
    },
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "HERO-02",
    name: "Lyra Veloestelar",
    characterClass: "Mago",
    level: 60,
    guild: "Círculo Arcano",
    stats: {
      attack: 310,
      defense: 110,
      mana: 680,
      critRate: 35
    },
    createdAt: "2026-02-10T14:30:00.000Z"
  },
  {
    id: "HERO-03",
    name: "Kaelen Sombrío",
    characterClass: "Arquero",
    level: 38,
    guild: "Centinelas del Bosque",
    stats: {
      attack: 225,
      defense: 130,
      mana: 190,
      critRate: 42
    },
    createdAt: "2026-03-05T09:15:00.000Z"
  }
];

let heroesStore = [...initialHeroes];

export const findAll = async () => {
  return [...heroesStore];
};

export const findById = async (id) => {
  return heroesStore.find((hero) => hero.id.toUpperCase() === String(id).toUpperCase()) || null;
};

export const findByName = async (name) => {
  return (
    heroesStore.find((hero) => hero.name.toLowerCase() === String(name).trim().toLowerCase()) ||
    null
  );
};

export const save = async (heroRecord) => {
  heroesStore.push(heroRecord);
  return heroRecord;
};
