const inMemoryLoadouts = [
  {
    id: "LDT-01",
    squadName: "Apex Predators",
    dropZone: "Pochinki Central",
    primaryWeapon: "Rifle de Asalto M416 Silenciado",
    rarityTier: "Legendario",
    shieldCapacity: 200,
    createdAt: "2026-10-12T18:00:00.000Z"
  },
  {
    id: "LDT-02",
    squadName: "Storm Runners",
    dropZone: "Tilted Towers",
    primaryWeapon: "Francotirador AWM Magnum",
    rarityTier: "Mitico",
    shieldCapacity: 250,
    createdAt: "2026-10-13T20:15:00.000Z"
  }
];

export const findAllLoadouts = async () => [...inMemoryLoadouts];

export const findLoadoutById = async (id) => {
  const item = inMemoryLoadouts.find((l) => l.id === String(id));
  return item ? { ...item } : null;
};

export const saveLoadout = async (data) => {
  const newItem = { ...data };
  inMemoryLoadouts.push(newItem);
  return { ...newItem };
};
