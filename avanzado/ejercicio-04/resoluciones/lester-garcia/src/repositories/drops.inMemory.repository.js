const initialItems = [
  {
    "id": "DRP-01",
    "sector": "Pochinki-Norte",
    "stormPhase": 2,
    "activeSquads": 14,
    "crateLooted": false
  },
  {
    "id": "DRP-02",
    "sector": "Base-Militar",
    "stormPhase": 6,
    "activeSquads": 3,
    "crateLooted": true
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
