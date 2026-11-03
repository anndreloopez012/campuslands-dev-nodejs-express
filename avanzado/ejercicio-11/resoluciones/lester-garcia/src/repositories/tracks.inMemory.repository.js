const initialItems = [
  {
    "id": "TRK-01",
    "isrc": "US-S1Z-26-00001",
    "title": "Midnight Synthwave",
    "artist": "Kavinsky",
    "bpm": 118
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
