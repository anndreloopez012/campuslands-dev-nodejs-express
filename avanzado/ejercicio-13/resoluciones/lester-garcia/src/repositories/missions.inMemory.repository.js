const initialItems = [
  {
    "id": "MSN-01",
    "starship": "USS Nostromo",
    "sector": "Zeta II Reticuli",
    "warpFactor": 4.2,
    "status": "DEEP_SPACE"
  },
  {
    "id": "MSN-02",
    "starship": "Atreides Heighliner",
    "sector": "Arrakis Orbit",
    "warpFactor": 9.1,
    "status": "DOCKED"
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
