const initialItems = [
  {
    "id": "LDT-01",
    "proPlayer": "s1mple",
    "primaryWeapon": "AWP Dragon Lore",
    "headshotPct": 68.5,
    "edpi": 1236
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
