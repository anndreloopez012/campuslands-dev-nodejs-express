const initialItems = [
  {
    "id": "CFG-01",
    "tournamentName": "Worlds 2026 Championship",
    "patchVersion": "14.21",
    "chronobreakEnabled": true,
    "maxPauseSeconds": 900
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
