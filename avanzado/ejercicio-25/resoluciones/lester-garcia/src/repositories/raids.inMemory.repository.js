const initialItems = [
  {
    "id": "RAID-01",
    "dungeon": "Ciudadela de la Corona de Hielo",
    "boss": "El Rey Exánime",
    "minGearScore": 5800,
    "difficulty": "Heroic_25"
  }
];

let store = [...initialItems];

export const findAll = async () => [...store];

export const findById = async (id) =>
  store.find((item) => item.id.toUpperCase() === String(id).toUpperCase()) || null;

export const save = async (record) => {
  store.push(record);
  return record;
};
